type ICompactGuard = [
  type: number,
  rules: [ref: string, name?: string, optional?: 0 | 1][],
];

const TYPE_OBJ = 1;
const TYPE_ARRAY = 2;
const TYPE_TUPLE = 3;

const guardMap: Record<string, ICompactGuard> = {
  /* RULE_MAP */
};

export function $tsGuard$(key: string, value: any, prop?: string): any {
  const guard = guardMap[key];
  if (guard) {
    guardType(prop ? value[prop] : value, guard);
  }
  return value;
}

function guardType(obj: any, guard: ICompactGuard, optional?: boolean) {
  const [type, rules] = guard;
  obj = ensureType(obj, type, optional);
  if (obj && rules) {
    for (const [ref, name, bOptional] of rules) {
      const childGuard = guardMap[ref];
      if (!childGuard) {
        return;
      }
      const childOptional = !!bOptional;
      if (type === TYPE_ARRAY && !name) {
        for (let i = 0; i < obj.length; i += 1) {
          obj[i] = guardType(obj[i], childGuard, childOptional);
        }
      }
      if ([TYPE_TUPLE, TYPE_OBJ].includes(type) && name) {
        const value = guardType(obj[name], childGuard, childOptional);
        if (value !== undefined) {
          obj[name] = value;
        }
      }
    }
  }
  return obj;
}

function ensureType(obj: any, type: number, optional?: boolean) {
  if ((obj === null || obj === undefined) && optional) {
    return obj;
  }
  if ([TYPE_ARRAY, TYPE_TUPLE].includes(type) && !Array.isArray(obj)) {
    return [];
  }
  if (type === TYPE_OBJ && (!obj || typeof obj !== 'object')) {
    return {};
  }
  return obj;
}
