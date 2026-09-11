import type { Locale } from "../config";
import { vi, type Dict } from "./vi";
import { en } from "./en";
import { ja } from "./ja";
import { zh } from "./zh";
import { ko } from "./ko";

export type { Dict };

export const DICTS: Record<Locale, Dict> = { vi, en, ja, zh, ko };

/** Điền `{name}`, `{list}`… vào chuỗi mẫu. Thứ tự từ mỗi thứ tiếng mỗi khác. */
export function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? `{${key}}`);
}
