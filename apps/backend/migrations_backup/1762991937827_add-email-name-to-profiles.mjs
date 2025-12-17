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
  // Add email and name columns to profiles table
  pgm.addColumns('profiles', {
    email: {
      type: 'varchar(255)',
      notNull: true,
      default: '',
    },
    name: {
      type: 'varchar(255)',
      notNull: true,
      default: '',
    },
  });

  // Create index on email for search
  pgm.createIndex('profiles', 'email', { name: 'idx_profiles_email' });
  
  // Create index on name for search
  pgm.createIndex('profiles', 'name', { name: 'idx_profiles_name' });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  // Drop indexes
  pgm.dropIndex('profiles', 'email', { name: 'idx_profiles_email', ifExists: true });
  pgm.dropIndex('profiles', 'name', { name: 'idx_profiles_name', ifExists: true });
  
  // Drop columns
  pgm.dropColumns('profiles', ['email', 'name']);
};
