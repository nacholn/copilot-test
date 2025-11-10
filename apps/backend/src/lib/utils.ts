/**
 * Transforms a snake_case database row to camelCase object
 * @param row Database row with snake_case keys
 * @returns Object with camelCase keys
 */
export function transformDbRow<T = Record<string, any>>(row: Record<string, any>): T {
  const transformed: Record<string, any> = {};
  for (const [key, value] of Object.entries(row)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    transformed[camelKey] = value;
  }
  return transformed as T;
}

/**
 * Transforms camelCase object keys to snake_case for database operations
 * @param obj Object with camelCase keys
 * @returns Object with snake_case keys
 */
export function toSnakeCase(obj: Record<string, any>): Record<string, any> {
  const transformed: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      transformed[snakeKey] = value;
    }
  }
  return transformed;
}

/**
 * Transforms a profile database row to Profile type
 */
export function transformProfile(profile: Record<string, any>) {
  return {
    id: profile.id,
    userId: profile.user_id,
    level: profile.level,
    bikeType: profile.bike_type,
    city: profile.city,
    latitude: profile.latitude,
    longitude: profile.longitude,
    dateOfBirth: profile.date_of_birth,
    avatar: profile.avatar,
    bio: profile.bio,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}
