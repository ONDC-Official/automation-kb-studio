import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** The only sanctioned way to compose classNames — merges conditional + conflicting Tailwind classes. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
