/**
 * Generate a URL-friendly slug from text
 * @param text - The text to convert to a slug
 * @param maxLength - Maximum length of the slug (default: 50)
 * @returns A URL-friendly slug
 */
export function generateSlug(text: string, maxLength: number = 50): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .substring(0, maxLength) // Limit length
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate a unique slug by appending a short ID
 * @param text - The text to convert to a slug
 * @param id - Unique identifier to append
 * @returns A unique URL-friendly slug
 */
export function generateUniqueSlug(text: string, id: string): string {
  const baseSlug = generateSlug(text, 40); // Leave room for ID
  const shortId = id.substring(0, 8); // Use first 8 characters of ID
  return `${baseSlug}-${shortId}`;
}
