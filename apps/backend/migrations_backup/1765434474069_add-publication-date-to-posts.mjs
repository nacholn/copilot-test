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
  // Add publication_date field for posts
  pgm.addColumns('posts', {
    publication_date: {
      type: 'timestamp with time zone',
      comment: 'Publication date for the post (optional, managed from webadmin)',
    },
  });

  // Create index on publication_date for sorting
  pgm.createIndex('posts', 'publication_date', { 
    name: 'idx_posts_publication_date',
    where: 'publication_date IS NOT NULL',
  });

  // Set publication_date to created_at for existing friends posts
  pgm.sql(`
    UPDATE posts
    SET publication_date = created_at
    WHERE visibility = 'friends' AND publication_date IS NULL;
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  // Drop index
  pgm.dropIndex('posts', 'publication_date', { 
    name: 'idx_posts_publication_date', 
    ifExists: true 
  });

  // Drop column
  pgm.dropColumns('posts', ['publication_date']);
};
