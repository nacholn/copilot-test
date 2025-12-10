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
      unique: true,
    },
    description: {
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
      type: 'varchar(50)',
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

  // Create indexes
  pgm.createIndex('groups', 'name', { name: 'idx_groups_name' });
  pgm.createIndex('group_members', 'group_id', { name: 'idx_group_members_group_id' });
  pgm.createIndex('group_members', 'user_id', { name: 'idx_group_members_user_id' });

  // Create unique constraint to prevent duplicate memberships
  pgm.createConstraint('group_members', 'unique_group_user', {
    unique: ['group_id', 'user_id'],
  });

  // Create trigger to automatically update updated_at for groups
  pgm.sql(`
    CREATE TRIGGER update_groups_updated_at
      BEFORE UPDATE ON groups
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  // Drop trigger
  pgm.sql('DROP TRIGGER IF EXISTS update_groups_updated_at ON groups;');

  // Drop constraints
  pgm.dropConstraint('group_members', 'unique_group_user', { ifExists: true });

  // Drop indexes
  pgm.dropIndex('group_members', 'user_id', { name: 'idx_group_members_user_id', ifExists: true });
  pgm.dropIndex('group_members', 'group_id', { name: 'idx_group_members_group_id', ifExists: true });
  pgm.dropIndex('groups', 'name', { name: 'idx_groups_name', ifExists: true });

  // Drop tables
  pgm.dropTable('group_members', { ifExists: true });
  pgm.dropTable('groups', { ifExists: true });
};
