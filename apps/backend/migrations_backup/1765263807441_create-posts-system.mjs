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
  // Create posts table for storing news posts
  pgm.createTable('posts', {
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
      comment: 'The user who created the post',
    },
    title: {
      type: 'varchar(500)',
      notNull: true,
      comment: 'Post title',
    },
    content: {
      type: 'text',
      notNull: true,
      comment: 'Post content/body',
    },
    visibility: {
      type: 'varchar(20)',
      notNull: true,
      default: "'public'",
      check: "visibility IN ('public', 'friends')",
      comment: 'Who can see the post: public (everyone) or friends (only user friends)',
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

  // Create indexes for posts table
  pgm.createIndex('posts', 'user_id', { name: 'idx_posts_user_id' });
  pgm.createIndex('posts', 'visibility', { name: 'idx_posts_visibility' });
  pgm.createIndex('posts', 'created_at', { name: 'idx_posts_created_at' });

  // Create post_images table for storing multiple images per post
  pgm.createTable('post_images', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    post_id: {
      type: 'uuid',
      notNull: true,
      references: 'posts(id)',
      onDelete: 'CASCADE',
      comment: 'The post this image belongs to',
    },
    image_url: {
      type: 'text',
      notNull: true,
      comment: 'Cloudinary image URL',
    },
    cloudinary_public_id: {
      type: 'text',
      notNull: true,
      comment: 'Cloudinary public ID for management',
    },
    display_order: {
      type: 'integer',
      notNull: true,
      default: 0,
      comment: 'Order in which images should be displayed',
    },
    created_at: {
      type: 'timestamp with time zone',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  // Create indexes for post_images table
  pgm.createIndex('post_images', 'post_id', { name: 'idx_post_images_post_id' });
  pgm.createIndex('post_images', ['post_id', 'display_order'], { 
    name: 'idx_post_images_post_order' 
  });

  // Create post_replies table for storing replies to posts
  pgm.createTable('post_replies', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    post_id: {
      type: 'uuid',
      notNull: true,
      references: 'posts(id)',
      onDelete: 'CASCADE',
      comment: 'The post this reply belongs to',
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'profiles(user_id)',
      onDelete: 'CASCADE',
      comment: 'The user who wrote the reply',
    },
    content: {
      type: 'text',
      notNull: true,
      comment: 'Reply content',
    },
    created_at: {
      type: 'timestamp with time zone',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  // Create indexes for post_replies table
  pgm.createIndex('post_replies', 'post_id', { name: 'idx_post_replies_post_id' });
  pgm.createIndex('post_replies', 'user_id', { name: 'idx_post_replies_user_id' });
  pgm.createIndex('post_replies', 'created_at', { name: 'idx_post_replies_created_at' });

  // Create post_views table for tracking which posts users have seen
  pgm.createTable('post_views', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    post_id: {
      type: 'uuid',
      notNull: true,
      references: 'posts(id)',
      onDelete: 'CASCADE',
      comment: 'The post that was viewed',
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'profiles(user_id)',
      onDelete: 'CASCADE',
      comment: 'The user who viewed the post',
    },
    last_reply_count_seen: {
      type: 'integer',
      notNull: true,
      default: 0,
      comment: 'Number of replies at the time of viewing',
    },
    viewed_at: {
      type: 'timestamp with time zone',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  // Create indexes for post_views table
  pgm.createIndex('post_views', 'post_id', { name: 'idx_post_views_post_id' });
  pgm.createIndex('post_views', 'user_id', { name: 'idx_post_views_user_id' });
  pgm.createIndex('post_views', ['user_id', 'post_id'], { 
    name: 'idx_post_views_user_post',
    unique: true,
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  // Drop tables in reverse order (respecting foreign key constraints)
  pgm.dropTable('post_views', { ifExists: true });
  pgm.dropTable('post_replies', { ifExists: true });
  pgm.dropTable('post_images', { ifExists: true });
  pgm.dropTable('posts', { ifExists: true });
};
