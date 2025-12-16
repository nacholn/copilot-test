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
  pgm.createTable('multilingual_posts', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    author_id: {
      type: 'uuid',
      notNull: true,
      references: 'profiles(user_id)',
      onDelete: 'CASCADE',
      comment: 'The author who created the post',
    },
    title: {
      type: 'jsonb',
      notNull: true,
      default: "'{}'",
      comment: 'Multilingual post title stored as JSONB',
    },
    content: {
      type: 'jsonb',
      notNull: true,
      default: "'{}'",
      comment: 'Multilingual post content stored as JSONB',
    },
    default_language: {
      type: 'varchar(5)',
      default: "'en'",
      comment: 'Default language for the post',
    },
    available_languages: {
      type: 'text[]',
      default: pgm.func("ARRAY['en']"),
      comment: 'Available languages for this post',
    },
    created_at: {
      type: 'timestamp with time zone',
      notNull: true,
      default: pgm.func('NOW()'),
    },
    updated_at: {
      type: 'timestamp with time zone',
      notNull: true,
      default: pgm.func('NOW()'),
    },
  });

  // Add constraints
  pgm.addConstraint('multilingual_posts', 'title_not_empty', {
    check: "jsonb_typeof(title) = 'object' AND title != '{}'",
  });

  pgm.addConstraint('multilingual_posts', 'content_not_empty', {
    check: "jsonb_typeof(content) = 'object' AND content != '{}'",
  });

  // Create indexes for performance
  pgm.createIndex('multilingual_posts', 'author_id', { name: 'idx_multilingual_posts_author' });
  pgm.createIndex('multilingual_posts', 'title', {
    name: 'idx_multilingual_posts_title_gin',
    method: 'gin',
  });
  pgm.createIndex('multilingual_posts', 'content', {
    name: 'idx_multilingual_posts_content_gin',
    method: 'gin',
  });
  pgm.createIndex('multilingual_posts', 'available_languages', {
    name: 'idx_multilingual_posts_languages',
    method: 'gin',
  });

  // Create updated_at trigger function (if it doesn't exist)
  pgm.createFunction(
    'update_updated_at_column',
    [],
    {
      returns: 'trigger',
      language: 'plpgsql',
      replace: true,
    },
    `
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
`
  );

  // Create trigger for updated_at
  pgm.createTrigger('multilingual_posts', 'update_multilingual_posts_updated_at', {
    when: 'BEFORE',
    operation: 'UPDATE',
    function: 'update_updated_at_column',
    level: 'ROW',
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('multilingual_posts', { ifExists: true, cascade: true });
};
