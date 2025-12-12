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
  // Add interaction tracking fields to profiles table
  pgm.addColumns('profiles', {
    last_login_at: {
      type: 'timestamp with time zone',
      comment: 'Last time the user logged in',
    },
    last_message_sent_at: {
      type: 'timestamp with time zone',
      comment: 'Last time the user sent a message (chat)',
    },
    last_post_created_at: {
      type: 'timestamp with time zone',
      comment: 'Last time the user created a post',
    },
    last_friend_accepted_at: {
      type: 'timestamp with time zone',
      comment: 'Last time the user accepted a friend request',
    },
    interaction_score: {
      type: 'numeric(10, 2)',
      default: 0,
      notNull: true,
      comment: 'Calculated interaction score based on user activity',
    },
  });

  // Create indexes for efficient querying and sorting
  pgm.createIndex('profiles', 'interaction_score', { 
    name: 'idx_profiles_interaction_score' 
  });
  pgm.createIndex('profiles', 'last_login_at', { 
    name: 'idx_profiles_last_login_at' 
  });

  // Create a function to calculate interaction score
  // Score calculation: 
  // - Recent login: up to 40 points (40 * e^(-days/30))
  // - Recent message: up to 25 points (25 * e^(-days/7))
  // - Recent post: up to 25 points (25 * e^(-days/14))
  // - Recent friend acceptance: up to 10 points (10 * e^(-days/30))
  // Maximum score: 100 points
  pgm.sql(`
    CREATE OR REPLACE FUNCTION calculate_interaction_score(
      p_last_login_at timestamp with time zone,
      p_last_message_sent_at timestamp with time zone,
      p_last_post_created_at timestamp with time zone,
      p_last_friend_accepted_at timestamp with time zone
    ) RETURNS numeric AS $$
    DECLARE
      v_score numeric := 0;
      v_days_since_login numeric;
      v_days_since_message numeric;
      v_days_since_post numeric;
      v_days_since_friend numeric;
    BEGIN
      -- Calculate days since last login (weight: 40)
      IF p_last_login_at IS NOT NULL THEN
        v_days_since_login := EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - p_last_login_at)) / 86400.0;
        v_score := v_score + (40 * EXP(-v_days_since_login / 30.0));
      END IF;

      -- Calculate days since last message (weight: 25)
      IF p_last_message_sent_at IS NOT NULL THEN
        v_days_since_message := EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - p_last_message_sent_at)) / 86400.0;
        v_score := v_score + (25 * EXP(-v_days_since_message / 7.0));
      END IF;

      -- Calculate days since last post (weight: 25)
      IF p_last_post_created_at IS NOT NULL THEN
        v_days_since_post := EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - p_last_post_created_at)) / 86400.0;
        v_score := v_score + (25 * EXP(-v_days_since_post / 14.0));
      END IF;

      -- Calculate days since last friend acceptance (weight: 10)
      IF p_last_friend_accepted_at IS NOT NULL THEN
        v_days_since_friend := EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - p_last_friend_accepted_at)) / 86400.0;
        v_score := v_score + (10 * EXP(-v_days_since_friend / 30.0));
      END IF;

      RETURN ROUND(v_score, 2);
    END;
    $$ LANGUAGE plpgsql IMMUTABLE;
  `);

  // Create a trigger function to automatically update interaction_score
  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_interaction_score()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.interaction_score := calculate_interaction_score(
        NEW.last_login_at,
        NEW.last_message_sent_at,
        NEW.last_post_created_at,
        NEW.last_friend_accepted_at
      );
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Create trigger to update score before insert or update
  pgm.createTrigger('profiles', 'update_profiles_interaction_score', {
    when: 'BEFORE',
    operation: ['INSERT', 'UPDATE'],
    function: {
      name: 'update_interaction_score',
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
  // Drop trigger
  pgm.dropTrigger('profiles', 'update_profiles_interaction_score', { ifExists: true });

  // Drop functions
  pgm.sql('DROP FUNCTION IF EXISTS update_interaction_score();');
  pgm.sql('DROP FUNCTION IF EXISTS calculate_interaction_score(timestamp with time zone, timestamp with time zone, timestamp with time zone, timestamp with time zone);');

  // Drop indexes
  pgm.dropIndex('profiles', 'interaction_score', { name: 'idx_profiles_interaction_score', ifExists: true });
  pgm.dropIndex('profiles', 'last_login_at', { name: 'idx_profiles_last_login_at', ifExists: true });

  // Drop columns
  pgm.dropColumns('profiles', [
    'last_login_at',
    'last_message_sent_at',
    'last_post_created_at',
    'last_friend_accepted_at',
    'interaction_score',
  ]);
};
