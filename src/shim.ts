/**
 * Guard the value to make sure it satifies its declaration.
 * Required non-primitive fields will be assigned to an empty object or array if not provided.
 *
 * It will be compiled by `ts-morph`.
 */
export function tsGuard<T>(value: T, key?: keyof T): T {
  return value;
}
