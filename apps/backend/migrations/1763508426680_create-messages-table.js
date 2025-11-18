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
  // Create messages table for friend-to-friend chat
  pgm.createTable('messages', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    sender_id: {
      type: 'uuid',
      notNull: true,
      references: 'profiles(user_id)',
      onDelete: 'CASCADE',
    },
    receiver_id: {
      type: 'uuid',
      notNull: true,
      references: 'profiles(user_id)',
      onDelete: 'CASCADE',
    },
    message: {
      type: 'text',
      notNull: true,
    },
    is_read: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    created_at: {
      type: 'timestamp with time zone',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  // Create indexes for efficient querying
  pgm.createIndex('messages', 'sender_id', { name: 'idx_messages_sender_id' });
  pgm.createIndex('messages', 'receiver_id', { name: 'idx_messages_receiver_id' });
  pgm.createIndex('messages', ['sender_id', 'receiver_id', 'created_at'], { 
    name: 'idx_messages_conversation' 
  });
  pgm.createIndex('messages', ['receiver_id', 'is_read'], { 
    name: 'idx_messages_unread' 
  });
  
  // Add check constraint to prevent self-messaging
  pgm.addConstraint('messages', 'no_self_message', {
    check: 'sender_id != receiver_id',
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  // Drop table (constraints and indexes will be dropped automatically)
  pgm.dropTable('messages', { ifExists: true });
};
