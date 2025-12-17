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
  // Create notifications table for tracking all types of notifications
  pgm.createTable('notifications', {
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
      comment: 'The user who receives the notification',
    },
    type: {
      type: 'varchar(50)',
      notNull: true,
      check: "type IN ('friend_request', 'friend_request_accepted', 'message', 'system')",
      comment: 'Type of notification - extensible for future notification types',
    },
    title: {
      type: 'varchar(255)',
      notNull: true,
      comment: 'Notification title/headline',
    },
    message: {
      type: 'text',
      notNull: true,
      comment: 'Notification message content',
    },
    actor_id: {
      type: 'uuid',
      references: 'profiles(user_id)',
      onDelete: 'CASCADE',
      comment: 'The user who triggered the notification (if applicable)',
    },
    related_id: {
      type: 'uuid',
      comment: 'ID of related entity (friend_request_id, message_id, etc.)',
    },
    related_type: {
      type: 'varchar(50)',
      comment: 'Type of related entity (friend_request, message, etc.)',
    },
    is_read: {
      type: 'boolean',
      notNull: true,
      default: false,
      comment: 'Whether the notification has been read',
    },
    read_at: {
      type: 'timestamp with time zone',
      comment: 'When the notification was read',
    },
    action_url: {
      type: 'varchar(500)',
      comment: 'Optional URL for notification action',
    },
    created_at: {
      type: 'timestamp with time zone',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  // Create indexes for efficient querying
  pgm.createIndex('notifications', 'user_id', { 
    name: 'idx_notifications_user_id' 
  });
  pgm.createIndex('notifications', 'type', { 
    name: 'idx_notifications_type' 
  });
  pgm.createIndex('notifications', ['user_id', 'is_read'], { 
    name: 'idx_notifications_user_unread' 
  });
  pgm.createIndex('notifications', 'actor_id', { 
    name: 'idx_notifications_actor_id' 
  });
  pgm.createIndex('notifications', 'created_at', { 
    name: 'idx_notifications_created_at' 
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  // Drop table (constraints and indexes will be dropped automatically)
  pgm.dropTable('notifications', { ifExists: true });
};
