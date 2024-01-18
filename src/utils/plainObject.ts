export type PlainObject = Record<string, unknown>;

export function isPlainObject(obj: unknown): obj is PlainObject {
  return Boolean(obj) && obj!.constructor === Object;
}

export function isEmptyObject(obj: unknown): boolean {
  return isPlainObject(obj) && Object.keys(obj).length === 0;
}
