/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  // Add 'group_message' to notification_type enum
  pgm.sql(`
    ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'group_message';
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  // Note: PostgreSQL doesn't support removing enum values easily
  // This would require recreating the enum and updating all dependent objects
  // For now, we'll leave the value in place as it won't cause issues
  pgm.sql('-- Cannot easily remove enum value, leaving in place');
};
