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
  // Create friend_requests table to track pending, accepted, and rejected requests
  pgm.createTable('friend_requests', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    requester_id: {
      type: 'uuid',
      notNull: true,
      references: 'profiles(user_id)',
      onDelete: 'CASCADE',
    },
    addressee_id: {
      type: 'uuid',
      notNull: true,
      references: 'profiles(user_id)',
      onDelete: 'CASCADE',
    },
    status: {
      type: 'varchar(20)',
      notNull: true,
      default: 'pending',
      check: "status IN ('pending', 'accepted', 'rejected')",
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

  // Create indexes for efficient querying
  pgm.createIndex('friend_requests', 'requester_id', { 
    name: 'idx_friend_requests_requester_id' 
  });
  pgm.createIndex('friend_requests', 'addressee_id', { 
    name: 'idx_friend_requests_addressee_id' 
  });
  pgm.createIndex('friend_requests', 'status', { 
    name: 'idx_friend_requests_status' 
  });
  
  // Create unique constraint to prevent duplicate pending requests
  pgm.addConstraint('friend_requests', 'unique_friend_request', {
    unique: ['requester_id', 'addressee_id', 'status'],
  });
  
  // Add check constraint to prevent self-friend requests
  pgm.addConstraint('friend_requests', 'no_self_friend_request', {
    check: 'requester_id != addressee_id',
  });

  // Create trigger to update updated_at timestamp
  pgm.createTrigger('friend_requests', 'update_friend_requests_updated_at', {
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
  pgm.dropTable('friend_requests', { ifExists: true });
};
