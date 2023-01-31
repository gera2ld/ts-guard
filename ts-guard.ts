import {
  CallExpression,
  Project,
  ProjectOptions,
  ts,
  Type,
} from "https://deno.land/x/ts_morph/mod.ts";
import { readTemplate } from "./util.ts";

enum DataType {
  others,
  object,
  array,
  tuple,
}

interface IArrayTypeInfo {
  type: DataType.array;
  param?: ITypeInfo;
  optional?: boolean;
}

interface IObjectTypeInfo {
  type: DataType.object | DataType.tuple;
  param?: Record<string, ITypeInfo>;
  optional?: boolean;
}

interface IOtherTypeInfo {
  type: DataType.others;
  optional?: boolean;
}

type ITypeInfo = IArrayTypeInfo | IObjectTypeInfo | IOtherTypeInfo;

type IGuardRule = {
  /** The name of the current field. */
  name: string;
  /**
   * The properties of the current field.
   *
   * 0b 0 00
   *    |  |
   *    |  +---- type of the field (`(flag >> 1) & 3`)
   *    +------- whether the field optional (`flag & 1`)
   */
  flag: number;
  /**
   * The field rules of this object, only applicable when the current field
   * is an object or an array of objects.
   */
  children?: IGuardRule[];
};
type ICompactGuardRule = [
  flag: number,
  name?: string,
  children?: ICompactGuardRule[],
];

type ITypeMap = Map<string, { id: number; info: ITypeInfo; text?: string }>;

type IGuardInfo = [CallExpression<ts.CallExpression>, string];

let id = 0;
const typeMap: ITypeMap = new Map();

export async function compile(options?: ProjectOptions) {
  const project = new Project({
    tsConfigFilePath: "tsconfig.json",
    compilerOptions: {
      outDir: "dist",
    },
    ...options,
  });
  await updateGuards(project, scanFiles(project));
  project.emitSync();
}

function guardType(type: Type<ts.Type>) {
  // const key = type.getSymbolOrThrow();
  const key = serialize(getTypeInfo(type));
  const text = type.getText().split(".").pop();
  let value = typeMap.get(key);
  if (value == null) {
    typeMap.set(
      key,
      value = {
        id: ++id,
        info: getTypeInfo(type),
        text,
      },
    );
  }
  return { value, text };
}

function tsGuard(project: Project, node: CallExpression<ts.CallExpression>) {
  const propArg = node.getArguments()[1];
  const prop = propArg?.getType().getLiteralValueOrThrow() as string;
  const typeChecker = project.getTypeChecker();
  const signature = typeChecker.getResolvedSignatureOrThrow(node);
  const responseType = typeChecker.getReturnTypeOfSignature(signature);
  const type = prop
    ? responseType.getPropertyOrThrow(prop).getTypeAtLocation(node)
    : responseType;
  const { value, text } = guardType(type);
  return [node, `/* ${text} */ ${value.id}`] as IGuardInfo;
}

function scanFiles(project: Project) {
  const sourceFiles = project.getSourceFiles();
  const filesWithGuard: [string, IGuardInfo[]][] = [];
  for (const sourceFile of sourceFiles) {
    // console.log("Visit file:", sourceFile.getFilePath());
    const guards: IGuardInfo[] = [];
    sourceFile.forEachDescendant((node) => {
      if (!node.isKind(ts.SyntaxKind.CallExpression)) return;
      const identifier = node.getExpressionIfKind(ts.SyntaxKind.Identifier);
      const identifierName = identifier?.getText();
      let guard: IGuardInfo | undefined;
      if (identifierName === "tsGuard") {
        guard = tsGuard(project, node);
      }
      if (guard) guards.push(guard);
    });
    if (guards.length) filesWithGuard.push([sourceFile.getFilePath(), guards]);
  }
  return { typeMap, files: filesWithGuard };
}

async function updateGuards(
  project: Project,
  { typeMap, files }: { typeMap: ITypeMap; files: [string, IGuardInfo[]][] },
) {
  const ruleMap = getRulesFromTypes(typeMap);
  let template = await readTemplate("./ts-guard.tpl.ts");
  const rules = Object.entries(ruleMap).map(
    ([key, { rule, text }]) =>
      `/* ${text} */
${key}: ${JSON.stringify(compactRule(rule))}`,
  );
  template = template.replace(
    /\{\s*\/\* RULE_MAP \*\/\s*\}/,
    `{\n${rules.join(",\n")}\n}`,
  );
  const guardFile = project.createSourceFile("src/_ts_guard.ts", template);
  files.forEach(([path, info]) => {
    const sourceFile = project.getSourceFileOrThrow(path);
    let guardPath = sourceFile.getRelativePathTo(guardFile);
    guardPath = guardPath.replace(/\.tsx?$/, ".js");
    if (!guardPath.startsWith(".")) guardPath = `./${guardPath}`;
    sourceFile.addImportDeclaration({
      moduleSpecifier: guardPath,
      namedImports: ["$tsGuard$"],
    });
    info.forEach(([node, id]) => {
      const identifier = node.getExpressionIfKind(ts.SyntaxKind.Identifier);
      if (!identifier) return;
      identifier.replaceWithText("$tsGuard$");
      node.insertArgument(0, id);
    });
  });
}

function getTypeInfo(type: Type<ts.Type>): ITypeInfo {
  if (type.isArray()) {
    return {
      type: DataType.array,
      param: getTypeInfo(type.getArrayElementTypeOrThrow()),
    };
  }
  if (type.isTuple()) {
    return {
      type: DataType.tuple,
      param: type.getTupleElements().reduce((prev, type, i) => {
        prev[i] = getTypeInfo(type);
        return prev;
      }, {} as Record<number, ITypeInfo>),
    };
  }
  if (type.isClassOrInterface() || type.isObject()) {
    const properties = type.getProperties();
    const result: Record<string, ITypeInfo> = {};
    for (const property of properties) {
      const propertyType = property.getValueDeclarationOrThrow().getType();
      result[property.getName()] = {
        ...getTypeInfo(propertyType),
        optional: property.isOptional(),
      };
    }
    return { type: DataType.object, param: result };
  }
  return { type: DataType.others };
}

function getRulesFromTypes(typeMap: ITypeMap) {
  const ruleMap: Record<number, { rule: IGuardRule; text?: string }> = {};
  for (const { id, info, text } of typeMap.values()) {
    if ([DataType.array, DataType.object].includes(info.type)) {
      const rule = getRuleFromType(info);
      if (rule) ruleMap[id] = { text, rule };
    }
  }
  return ruleMap;
}

function getRuleFromType(info: ITypeInfo, name = ""): IGuardRule | undefined {
  if (info.type === DataType.array) {
    const child = info.param && getRuleFromType(info.param);
    const result: IGuardRule = {
      name,
      flag: calcTypeFlag(info.type, info.optional),
    };
    if (child) result.children = [child];
    return result;
  }
  if (info.type === DataType.object || info.type === DataType.tuple) {
    const children = info.param &&
      (Object.entries(info.param)
        .map(([key, value]) => getRuleFromType(value, key))
        .filter(Boolean) as IGuardRule[]);
    const result: IGuardRule = {
      name,
      flag: calcTypeFlag(info.type, info.optional),
    };
    if (children?.length) result.children = children;
    return result;
  }
}

function compactRule(rule: IGuardRule) {
  const data: ICompactGuardRule = [rule.flag];
  if (rule.name || rule.children) data.push(rule.name || "");
  if (rule.children) data.push(rule.children.map(compactRule));
  return data;
}

function serialize(info: any): string {
  if (Array.isArray(info)) {
    return "[" + info.map(serialize).join(",") + "]";
  }
  if (info && typeof info === "object") {
    return (
      "{" +
      Object.keys(info)
        .sort()
        .map((key) => `${JSON.stringify(key)}:${serialize(info[key])}`)
        .join(",") +
      "}"
    );
  }
  return JSON.stringify(info);
}

function calcTypeFlag(
  type: DataType,
  optional?: boolean,
) {
  return (+!!optional << 2) + type;
}
