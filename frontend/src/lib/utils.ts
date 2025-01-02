// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges and resolves conflicts in Tailwind CSS class names.
 * Combines conditional class logic (`clsx`) with conflict resolution (`twMerge`),
 * ensuring clean and predictable class outputs.
 *
 * @param inputs - Class values, including strings, arrays, or objects with conditional logic.
 * @returns A single resolved string of class names.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}