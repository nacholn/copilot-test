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
  // Create friendships table
  pgm.createTable('friendships', {
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
    friend_id: {
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
  });

  // Create indexes for efficient querying
  pgm.createIndex('friendships', 'user_id', { name: 'idx_friendships_user_id' });
  pgm.createIndex('friendships', 'friend_id', { name: 'idx_friendships_friend_id' });
  
  // Create unique constraint to prevent duplicate friendships
  pgm.addConstraint('friendships', 'unique_friendship', {
    unique: ['user_id', 'friend_id'],
  });
  
  // Add check constraint to prevent self-friendship
  pgm.addConstraint('friendships', 'no_self_friendship', {
    check: 'user_id != friend_id',
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  // Drop table (constraints and indexes will be dropped automatically)
  pgm.dropTable('friendships', { ifExists: true });
};
