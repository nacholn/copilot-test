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
  // Create groups table
  pgm.createTable('groups', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    name: {
      type: 'varchar(255)',
      notNull: true,
    },
    description: {
      type: 'text',
    },
    type: {
      type: 'varchar(20)',
      notNull: true,
      check: "type IN ('location', 'general')",
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
    main_image: {
      type: 'text',
    },
    cloudinary_public_id: {
      type: 'text',
    },
    created_by: {
      type: 'uuid',
      notNull: true,
      references: 'profiles(user_id)',
      onDelete: 'CASCADE',
    },
    created_at: {
      type: 'timestamp with time zone',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: 'timestamp with time zone',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  // Create indexes for groups
  pgm.createIndex('groups', 'type', { name: 'idx_groups_type' });
  pgm.createIndex('groups', 'city', { name: 'idx_groups_city' });
  pgm.createIndex('groups', 'created_by', { name: 'idx_groups_created_by' });

  // Create trigger to automatically update updated_at for groups
  pgm.sql(`
    CREATE TRIGGER update_groups_updated_at
      BEFORE UPDATE ON groups
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `);

  // Create group_members table (many-to-many relationship)
  pgm.createTable('group_members', {
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
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'profiles(user_id)',
      onDelete: 'CASCADE',
    },
    joined_at: {
      type: 'timestamp with time zone',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  // Create unique constraint to prevent duplicate memberships
  pgm.addConstraint('group_members', 'unique_group_member', {
    unique: ['group_id', 'user_id'],
  });

  // Create indexes for group_members
  pgm.createIndex('group_members', 'group_id', { name: 'idx_group_members_group_id' });
  pgm.createIndex('group_members', 'user_id', { name: 'idx_group_members_user_id' });

  // Create group_messages table
  pgm.createTable('group_messages', {
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
    sender_id: {
      type: 'uuid',
      notNull: true,
      references: 'profiles(user_id)',
      onDelete: 'CASCADE',
    },
    message: {
      type: 'text',
      notNull: true,
    },
    created_at: {
      type: 'timestamp with time zone',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  // Create indexes for group_messages
  pgm.createIndex('group_messages', 'group_id', { name: 'idx_group_messages_group_id' });
  pgm.createIndex('group_messages', 'sender_id', { name: 'idx_group_messages_sender_id' });
  pgm.createIndex('group_messages', ['group_id', 'created_at'], { 
    name: 'idx_group_messages_group_created' 
  });

  // Create group_message_reads table to track read status
  pgm.createTable('group_message_reads', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    message_id: {
      type: 'uuid',
      notNull: true,
      references: 'group_messages(id)',
      onDelete: 'CASCADE',
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'profiles(user_id)',
      onDelete: 'CASCADE',
    },
    read_at: {
      type: 'timestamp with time zone',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  // Create unique constraint to prevent duplicate reads
  pgm.addConstraint('group_message_reads', 'unique_message_read', {
    unique: ['message_id', 'user_id'],
  });

  // Create indexes for group_message_reads
  pgm.createIndex('group_message_reads', 'message_id', { name: 'idx_group_message_reads_message_id' });
  pgm.createIndex('group_message_reads', 'user_id', { name: 'idx_group_message_reads_user_id' });

  // Create group_images table for gallery
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

  // Create indexes for group_images
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
  // Drop tables in reverse order (respecting foreign key dependencies)
  pgm.dropTable('group_images', { ifExists: true, cascade: true });
  pgm.dropTable('group_message_reads', { ifExists: true, cascade: true });
  pgm.dropTable('group_messages', { ifExists: true, cascade: true });
  pgm.dropTable('group_members', { ifExists: true, cascade: true });
  
  // Drop trigger for groups
  pgm.sql('DROP TRIGGER IF EXISTS update_groups_updated_at ON groups;');
  
  // Drop groups table
  pgm.dropTable('groups', { ifExists: true, cascade: true });
};
