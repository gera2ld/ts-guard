type ICompactGuardRule = [
  flag: number,
  name?: string,
  children?: ICompactGuardRule[],
];

const TYPE_OBJ = 1;
const TYPE_ARRAY = 2;
const TYPE_TUPLE = 3;

const ruleMap: Record<number, ICompactGuardRule> = {
  /* RULE_MAP */
};

export function $tsGuard$<T>(id: number, value: T, prop?: string): T {
  const rule = ruleMap[id];
  if (rule) {
    guard(prop ? value[prop] : value, rule);
  }
  return value;
}

function guard(obj: any, rule: ICompactGuardRule) {
  const [flag, name, children] = rule;
  const { optional, type } = readFlag(flag);
  let value = name ? obj[name] : obj;
  if (value || !optional) {
    value = ensureType(value, type);
    if (type === TYPE_ARRAY) {
      if (children) {
        const [childRule] = children;
        value = value.map((item) => guard(item, childRule));
      }
    } else if (children) {
      for (const child of children) {
        value = guard(value, child);
      }
    }
    if (name) {
      obj[name] = value;
    } else {
      obj = value;
    }
  }
  return obj;
}

function ensureType(obj: any, type: number) {
  if ([TYPE_ARRAY, TYPE_TUPLE].includes(type) && !Array.isArray(obj)) {
    return [];
  }
  if (type === TYPE_OBJ && (!obj || typeof obj !== 'object')) {
    return {};
  }
  return obj;
}

function readFlag(flag: number) {
  const type = flag & 3;
  flag >>= 2;
  const optional = flag & 1;
  return { optional, type };
}
