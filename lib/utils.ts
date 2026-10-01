import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/** Erkennt Kanji (inkl. Iterationszeichen 々). */
export const KANJI_PATTERN = /[㐀-䶿一-鿿豈-﫿々〆ヶ]/;

export function containsKanji(text: string): boolean {
  return KANJI_PATTERN.test(text);
}
