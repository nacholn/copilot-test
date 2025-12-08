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
  // Create user_status table for tracking online/offline status
  pgm.createTable('user_status', {
    user_id: {
      type: 'uuid',
      primaryKey: true,
      references: 'profiles(user_id)',
      onDelete: 'CASCADE',
    },
    status: {
      type: 'varchar(20)',
      notNull: true,
      default: 'offline',
      check: "status IN ('online', 'offline', 'away')",
    },
    last_seen: {
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

  // Create indexes for efficient querying
  pgm.createIndex('user_status', 'status', { 
    name: 'idx_user_status_status' 
  });
  pgm.createIndex('user_status', 'last_seen', { 
    name: 'idx_user_status_last_seen' 
  });

  // Create trigger to update updated_at timestamp
  pgm.createTrigger('user_status', 'update_user_status_updated_at', {
    when: 'BEFORE',
    operation: 'UPDATE',
    function: {
      name: 'update_updated_at_column',
      replace: false,
    },
    level: 'ROW',
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  // Drop table (constraints, indexes, and triggers will be dropped automatically)
  pgm.dropTable('user_status', { ifExists: true });
};
