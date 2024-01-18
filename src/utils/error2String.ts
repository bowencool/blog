import { isPlainObject } from "./plainObject";

export function error2String(err: unknown): string {
  if (!err) return "";
  if (typeof err === "string") {
    return err;
  }
  if (err instanceof Error) {
    return `${err.name}: ${err.message}`;
  }
  if (isPlainObject(err)) {
    const key = ["message", "msg", "error", "err_msg", "error_message"];
    for (const k of key) {
      const v = err[k];
      if (typeof v === "string") return v;
    }
  }
  return JSON.stringify(err);
}
