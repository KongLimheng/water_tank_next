import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sanitize Khmer text to fix common Unicode rendering issues
 * This helps with iOS Safari Khmer text rendering problems
 */
export const sanitizeKhmerText = (text: string): string => {
  if (typeof text !== 'string') return text

  // Fix common Khmer Unicode character sequences
  // Replace incorrect coeng + vowel combinations with correct ones
  return text
    .replace(/\u17A2\u17BB\u17B8/g, '\u17A2\u17CA\u17B8') // Fix specific vowel-coeng sequence
    .replace(/\u17B6\u17C1/g, '\u17C1\u17B6') // Fix vowel order
    .replace(/\u17B7\u17C1/g, '\u17C1\u17B7') // Fix vowel order
    .replace(/\u17B8\u17C1/g, '\u17C1\u17B8') // Fix vowel order
    .normalize('NFC') // Normalize to composed form for better rendering
}
