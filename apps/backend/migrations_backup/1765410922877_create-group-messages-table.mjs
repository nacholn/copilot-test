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

  // Create group_message_reads table to track which users have read which messages
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

  // Create indexes
  pgm.createIndex('group_messages', 'group_id', { name: 'idx_group_messages_group_id' });
  pgm.createIndex('group_messages', 'sender_id', { name: 'idx_group_messages_sender_id' });
  pgm.createIndex('group_messages', 'created_at', { name: 'idx_group_messages_created_at' });
  pgm.createIndex('group_message_reads', 'message_id', { name: 'idx_group_message_reads_message_id' });
  pgm.createIndex('group_message_reads', 'user_id', { name: 'idx_group_message_reads_user_id' });

  // Create unique constraint to prevent duplicate reads
  pgm.createConstraint('group_message_reads', 'unique_message_user', {
    unique: ['message_id', 'user_id'],
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  // Drop constraints
  pgm.dropConstraint('group_message_reads', 'unique_message_user', { ifExists: true });

  // Drop indexes
  pgm.dropIndex('group_message_reads', 'user_id', { name: 'idx_group_message_reads_user_id', ifExists: true });
  pgm.dropIndex('group_message_reads', 'message_id', { name: 'idx_group_message_reads_message_id', ifExists: true });
  pgm.dropIndex('group_messages', 'created_at', { name: 'idx_group_messages_created_at', ifExists: true });
  pgm.dropIndex('group_messages', 'sender_id', { name: 'idx_group_messages_sender_id', ifExists: true });
  pgm.dropIndex('group_messages', 'group_id', { name: 'idx_group_messages_group_id', ifExists: true });

  // Drop tables
  pgm.dropTable('group_message_reads', { ifExists: true });
  pgm.dropTable('group_messages', { ifExists: true });
};
