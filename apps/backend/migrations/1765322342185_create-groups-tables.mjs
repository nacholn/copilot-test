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
    location: {
      type: 'varchar(255)',
      comment: 'Location or "general" for global groups',
    },
    avatar: {
      type: 'text',
      comment: 'Main group image URL',
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
  pgm.createIndex('groups', 'name', { name: 'idx_groups_name' });
  pgm.createIndex('groups', 'location', { name: 'idx_groups_location' });
  pgm.createIndex('groups', 'created_by', { name: 'idx_groups_created_by' });
  pgm.createIndex('groups', 'created_at', { name: 'idx_groups_created_at' });

  // Create trigger to update updated_at
  pgm.sql(`
    CREATE TRIGGER update_groups_updated_at
      BEFORE UPDATE ON groups
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `);

  // Create group_members table
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
    role: {
      type: 'varchar(20)',
      notNull: true,
      default: 'member',
      check: "role IN ('admin', 'member')",
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
  pgm.createIndex('group_members', 'role', { name: 'idx_group_members_role' });

  // Create group_images table
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
      type: 'varchar(255)',
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

  // Create indexes for group_images
  pgm.createIndex('group_images', 'group_id', { name: 'idx_group_images_group_id' });
  pgm.createIndex('group_images', ['group_id', 'is_primary'], { 
    name: 'idx_group_images_primary' 
  });
  pgm.createIndex('group_images', ['group_id', 'display_order'], { 
    name: 'idx_group_images_display_order' 
  });

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
    name: 'idx_group_messages_conversation' 
  });

  // Create group_message_reads table to track read status per user
  pgm.createTable('group_message_reads', {
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
    last_read_message_id: {
      type: 'uuid',
      references: 'group_messages(id)',
      onDelete: 'SET NULL',
    },
    last_read_at: {
      type: 'timestamp with time zone',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  // Create unique constraint for group_message_reads
  pgm.addConstraint('group_message_reads', 'unique_group_user_read', {
    unique: ['group_id', 'user_id'],
  });

  // Create indexes for group_message_reads
  pgm.createIndex('group_message_reads', ['group_id', 'user_id'], { 
    name: 'idx_group_message_reads_group_user' 
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  // Drop tables in reverse order (handles foreign key constraints)
  pgm.dropTable('group_message_reads', { ifExists: true });
  pgm.dropTable('group_messages', { ifExists: true });
  pgm.dropTable('group_images', { ifExists: true });
  pgm.dropTable('group_members', { ifExists: true });
  
  // Drop trigger
  pgm.sql('DROP TRIGGER IF EXISTS update_groups_updated_at ON groups;');
  
  // Drop groups table
  pgm.dropTable('groups', { ifExists: true });
};
