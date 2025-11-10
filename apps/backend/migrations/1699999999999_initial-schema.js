/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // Create profiles table
  pgm.createTable('profiles', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      unique: true,
    },
    level: {
      type: 'varchar(20)',
      notNull: true,
      check: "level IN ('beginner', 'intermediate', 'advanced', 'expert')",
    },
    bike_type: {
      type: 'varchar(20)',
      notNull: true,
      check: "bike_type IN ('road', 'mountain', 'hybrid', 'electric', 'gravel', 'other')",
    },
    city: {
      type: 'varchar(255)',
      notNull: true,
    },
    latitude: {
      type: 'decimal(10, 8)',
    },
    longitude: {
      type: 'decimal(11, 8)',
    },
    date_of_birth: {
      type: 'date',
    },
    avatar: {
      type: 'text',
    },
    bio: {
      type: 'text',
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

  // Create indexes
  pgm.createIndex('profiles', 'user_id', { name: 'idx_profiles_user_id' });
  pgm.createIndex('profiles', 'city', { name: 'idx_profiles_city' });
  pgm.createIndex('profiles', 'level', { name: 'idx_profiles_level' });
  pgm.createIndex('profiles', 'bike_type', { name: 'idx_profiles_bike_type' });

  // Create function to update updated_at timestamp
  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  // Create trigger to automatically update updated_at
  pgm.sql(`
    CREATE TRIGGER update_profiles_updated_at
      BEFORE UPDATE ON profiles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `);
};

exports.down = (pgm) => {
  // Drop trigger
  pgm.sql('DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;');

  // Drop function
  pgm.sql('DROP FUNCTION IF EXISTS update_updated_at_column();');

  // Drop indexes (will be dropped automatically with table, but explicit for clarity)
  pgm.dropIndex('profiles', 'user_id', { name: 'idx_profiles_user_id', ifExists: true });
  pgm.dropIndex('profiles', 'city', { name: 'idx_profiles_city', ifExists: true });
  pgm.dropIndex('profiles', 'level', { name: 'idx_profiles_level', ifExists: true });
  pgm.dropIndex('profiles', 'bike_type', { name: 'idx_profiles_bike_type', ifExists: true });

  // Drop table
  pgm.dropTable('profiles', { ifExists: true });
};
