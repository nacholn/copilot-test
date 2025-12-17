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
  // Add new columns to groups table
  pgm.addColumns('groups', {
    type: {
      type: 'varchar(20)',
      notNull: true,
      default: 'general',
      check: "type IN ('location', 'general')",
    },
    main_image: {
      type: 'text',
    },
    main_image_public_id: {
      type: 'text',
    },
    city: {
      type: 'varchar(255)',
    },
    latitude: {
      type: 'decimal(10, 8)',
    },
    longitude: {
      type: 'decimal(11, 8)',
    },
  });

  // Create group_images table for additional images
  pgm.createTable('group_images', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    group_id: {
      type: 'uuid',
      notNull: true,
      references: 'groups(id)',
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

  // Create indexes
  pgm.createIndex('groups', 'type', { name: 'idx_groups_type' });
  pgm.createIndex('groups', 'city', { name: 'idx_groups_city' });
  pgm.createIndex('group_images', 'group_id', { name: 'idx_group_images_group_id' });
  pgm.createIndex('group_images', ['group_id', 'display_order'], { 
    name: 'idx_group_images_group_order' 
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  // Drop indexes
  pgm.dropIndex('group_images', ['group_id', 'display_order'], {
    name: 'idx_group_images_group_order',
    ifExists: true,
  });
  pgm.dropIndex('group_images', 'group_id', { name: 'idx_group_images_group_id', ifExists: true });
  pgm.dropIndex('groups', 'city', { name: 'idx_groups_city', ifExists: true });
  pgm.dropIndex('groups', 'type', { name: 'idx_groups_type', ifExists: true });

  // Drop group_images table
  pgm.dropTable('group_images', { ifExists: true });

  // Drop new columns from groups table
  pgm.dropColumns('groups', [
    'type',
    'main_image',
    'main_image_public_id',
    'city',
    'latitude',
    'longitude',
  ]);
};
