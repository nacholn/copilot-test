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
  // Add is_admin column to profiles table, default to false
  pgm.addColumn('profiles', {
    is_admin: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
  });

  // Create index for faster lookups of admin users
  pgm.createIndex('profiles', 'is_admin', { name: 'idx_profiles_is_admin' });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  // Drop the index
  pgm.dropIndex('profiles', 'is_admin', { name: 'idx_profiles_is_admin', ifExists: true });

  // Drop the column
  pgm.dropColumn('profiles', 'is_admin', { ifExists: true });
};
