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
  // Create profile_images table for storing multiple images per profile
  pgm.createTable('profile_images', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'profiles(user_id)',
      onDelete: 'CASCADE',
    },
    image_url: {
      type: 'text',
      notNull: true,
    },
    cloudinary_public_id: {
      type: 'text',
      notNull: true,
    },
    is_primary: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    display_order: {
      type: 'integer',
      notNull: true,
      default: 0,
    },
    created_at: {
      type: 'timestamp with time zone',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  // Create indexes for efficient querying
  pgm.createIndex('profile_images', 'user_id', { name: 'idx_profile_images_user_id' });
  pgm.createIndex('profile_images', ['user_id', 'is_primary'], { 
    name: 'idx_profile_images_user_primary' 
  });
  pgm.createIndex('profile_images', ['user_id', 'display_order'], { 
    name: 'idx_profile_images_user_order' 
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  // Drop table (indexes will be dropped automatically)
  pgm.dropTable('profile_images', { ifExists: true });
};
