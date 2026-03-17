/**
 * Image utility functions
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

/**
 * Converts a relative image path to a full URL
 * If the path is already a full URL, returns it as-is
 */
export function getImageUrl(path: string | null | undefined): string {
  if (!path) return ''
  if (path.startsWith('http')) return path
  if (path.startsWith('blob:')) return path
  return process.env.NODE_ENV === 'production' ? `${BASE_URL}${path}` : path
}

/**
 * Converts multiple image paths to full URLs
 */
export function getImageUrls(
  paths: Array<string | null | undefined>,
): string[] {
  return paths.map((path) => getImageUrl(path)).filter(Boolean)
}
