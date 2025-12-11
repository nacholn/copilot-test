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
  // Add slug field for SEO-friendly URLs
  pgm.addColumns('groups', {
    slug: {
      type: 'varchar(255)',
      unique: true,
      comment: 'SEO-friendly URL slug',
    },
    meta_description: {
      type: 'varchar(500)',
      comment: 'Meta description for SEO',
    },
    keywords: {
      type: 'text',
      comment: 'SEO keywords (comma-separated)',
    },
  });

  // Create index on slug for fast lookups
  pgm.createIndex('groups', 'slug', { name: 'idx_groups_slug' });

  // Generate slugs for existing groups based on name
  pgm.sql(`
    UPDATE groups
    SET slug = LOWER(
      REGEXP_REPLACE(
        REGEXP_REPLACE(name, '[^a-zA-Z0-9\\s-]', '', 'g'),
        '\\s+', '-', 'g'
      )
    ) || '-' || SUBSTRING(CAST(id AS TEXT), 1, 8)
    WHERE slug IS NULL;
  `);

  // Make slug not null after generating values
  pgm.alterColumn('groups', 'slug', {
    notNull: true,
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  // Drop index
  pgm.dropIndex('groups', 'slug', { name: 'idx_groups_slug', ifExists: true });

  // Drop columns
  pgm.dropColumns('groups', ['slug', 'meta_description', 'keywords']);
};
