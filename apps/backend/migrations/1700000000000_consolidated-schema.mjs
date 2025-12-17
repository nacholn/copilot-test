/* eslint-disable camelcase */

/**
 * Consolidated database migration
 * This file combines all migrations into a single file for easier management
 */

export const shorthands = undefined;

export const up = async (pgm) => {
  // Migration: 1699999999999_initial-schema.mjs
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

  // Migration: 1762991937827_add-email-name-to-profiles.mjs
  // Add email and name columns to profiles table
    pgm.addColumns('profiles', {
      email: {
        type: 'varchar(255)',
        notNull: true,
        default: '',
      },
      name: {
        type: 'varchar(255)',
        notNull: true,
        default: '',
      },
    });
  
    // Create index on email for search
    pgm.createIndex('profiles', 'email', { name: 'idx_profiles_email' });
    
    // Create index on name for search
    pgm.createIndex('profiles', 'name', { name: 'idx_profiles_name' });

  // Migration: 1762991962858_create-friendships-table.mjs
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

  // Migration: 1763508399593_add-profile-images-table.mjs
  // Create profile_images table for storing multiple images per profile
    pgm.createTable('profile_images', {
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
      image_url: {
        type: 'text',
        notNull: true,
      },
      cloudinary_public_id: {
        type: 'text',
        notNull: true,
      },
      is_primary: {
        type: 'boolean',
        notNull: true,
        default: false,
      },
      display_order: {
        type: 'integer',
        notNull: true,
        default: 0,
      },
      created_at: {
        type: 'timestamp with time zone',
        notNull: true,
        default: pgm.func('CURRENT_TIMESTAMP'),
      },
    });
  
    // Create indexes for efficient querying
    pgm.createIndex('profile_images', 'user_id', { name: 'idx_profile_images_user_id' });
    pgm.createIndex('profile_images', ['user_id', 'is_primary'], { 
      name: 'idx_profile_images_user_primary' 
    });
    pgm.createIndex('profile_images', ['user_id', 'display_order'], { 
      name: 'idx_profile_images_user_order' 
    });

  // Migration: 1763508426680_create-messages-table.mjs
  // Create messages table for friend-to-friend chat
    pgm.createTable('messages', {
      id: {
        type: 'uuid',
        primaryKey: true,
        default: pgm.func('gen_random_uuid()'),
      },
      sender_id: {
        type: 'uuid',
        notNull: true,
        references: 'profiles(user_id)',
        onDelete: 'CASCADE',
      },
      receiver_id: {
        type: 'uuid',
        notNull: true,
        references: 'profiles(user_id)',
        onDelete: 'CASCADE',
      },
      message: {
        type: 'text',
        notNull: true,
      },
      is_read: {
        type: 'boolean',
        notNull: true,
        default: false,
      },
      created_at: {
        type: 'timestamp with time zone',
        notNull: true,
        default: pgm.func('CURRENT_TIMESTAMP'),
      },
    });
  
    // Create indexes for efficient querying
    pgm.createIndex('messages', 'sender_id', { name: 'idx_messages_sender_id' });
    pgm.createIndex('messages', 'receiver_id', { name: 'idx_messages_receiver_id' });
    pgm.createIndex('messages', ['sender_id', 'receiver_id', 'created_at'], { 
      name: 'idx_messages_conversation' 
    });
    pgm.createIndex('messages', ['receiver_id', 'is_read'], { 
      name: 'idx_messages_unread' 
    });
    
    // Add check constraint to prevent self-messaging
    pgm.addConstraint('messages', 'no_self_message', {
      check: 'sender_id != receiver_id',
    });

  // Migration: 1765192065126_create-friend-requests-table.mjs
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

  // Migration: 1765192065127_create-notifications-table.mjs
  // Create notifications table for tracking all types of notifications
    pgm.createTable('notifications', {
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
        comment: 'The user who receives the notification',
      },
      type: {
        type: 'varchar(50)',
        notNull: true,
        check: "type IN ('friend_request', 'friend_request_accepted', 'message', 'system')",
        comment: 'Type of notification - extensible for future notification types',
      },
      title: {
        type: 'varchar(255)',
        notNull: true,
        comment: 'Notification title/headline',
      },
      message: {
        type: 'text',
        notNull: true,
        comment: 'Notification message content',
      },
      actor_id: {
        type: 'uuid',
        references: 'profiles(user_id)',
        onDelete: 'CASCADE',
        comment: 'The user who triggered the notification (if applicable)',
      },
      related_id: {
        type: 'uuid',
        comment: 'ID of related entity (friend_request_id, message_id, etc.)',
      },
      related_type: {
        type: 'varchar(50)',
        comment: 'Type of related entity (friend_request, message, etc.)',
      },
      is_read: {
        type: 'boolean',
        notNull: true,
        default: false,
        comment: 'Whether the notification has been read',
      },
      read_at: {
        type: 'timestamp with time zone',
        comment: 'When the notification was read',
      },
      action_url: {
        type: 'varchar(500)',
        comment: 'Optional URL for notification action',
      },
      created_at: {
        type: 'timestamp with time zone',
        notNull: true,
        default: pgm.func('CURRENT_TIMESTAMP'),
      },
    });
  
    // Create indexes for efficient querying
    pgm.createIndex('notifications', 'user_id', { 
      name: 'idx_notifications_user_id' 
    });
    pgm.createIndex('notifications', 'type', { 
      name: 'idx_notifications_type' 
    });
    pgm.createIndex('notifications', ['user_id', 'is_read'], { 
      name: 'idx_notifications_user_unread' 
    });
    pgm.createIndex('notifications', 'actor_id', { 
      name: 'idx_notifications_actor_id' 
    });
    pgm.createIndex('notifications', 'created_at', { 
      name: 'idx_notifications_created_at' 
    });

  // Migration: 1765192065128_create-user-status-table.mjs
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

  // Migration: 1765263807441_create-posts-system.mjs
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

  // Migration: 1765263941426_add-post-reply-notification-type.mjs
  // Drop the existing check constraint
    pgm.dropConstraint('notifications', 'notifications_type_check', { ifExists: true });
    
    // Add the new check constraint with post_reply included
    pgm.addConstraint('notifications', 'notifications_type_check', {
      check: "type IN ('friend_request', 'friend_request_accepted', 'message', 'system', 'post_reply')",
    });

  // Migration: 1765268595371_add-new-post-notification-type.mjs
  // Drop the existing check constraint
    pgm.dropConstraint('notifications', 'notifications_type_check', { ifExists: true });
    
    // Add the new check constraint with new_post included
    pgm.addConstraint('notifications', 'notifications_type_check', {
      check: "type IN ('friend_request', 'friend_request_accepted', 'message', 'system', 'post_reply', 'new_post')",
    });

  // Migration: 1765407397929_create-groups-table.mjs
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

  // Migration: 1765408876568_add-group-images-and-location.mjs
  // Add new columns to groups table
    pgm.addColumns('groups', {
      type: {
        type: 'varchar(20)',
        notNull: true,
        default: 'general',
        check: "type IN ('location', 'general')",
      },
      main_image: {
        type: 'text',
      },
      main_image_public_id: {
        type: 'text',
      },
      city: {
        type: 'varchar(255)',
      },
      latitude: {
        type: 'decimal(10, 8)',
      },
      longitude: {
        type: 'decimal(11, 8)',
      },
    });
  
    // Create group_images table for additional images
    pgm.createTable('group_images', {
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
      image_url: {
        type: 'text',
        notNull: true,
      },
      cloudinary_public_id: {
        type: 'text',
        notNull: true,
      },
      display_order: {
        type: 'integer',
        notNull: true,
        default: 0,
      },
      created_at: {
        type: 'timestamp with time zone',
        notNull: true,
        default: pgm.func('CURRENT_TIMESTAMP'),
      },
    });
  
    // Create indexes
    pgm.createIndex('groups', 'type', { name: 'idx_groups_type' });
    pgm.createIndex('groups', 'city', { name: 'idx_groups_city' });
    pgm.createIndex('group_images', 'group_id', { name: 'idx_group_images_group_id' });
    pgm.createIndex('group_images', ['group_id', 'display_order'], { 
      name: 'idx_group_images_group_order' 
    });

  // Migration: 1765410922877_create-group-messages-table.mjs
  // Create group_messages table
    pgm.createTable('group_messages', {
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
      sender_id: {
        type: 'uuid',
        notNull: true,
        references: 'profiles(user_id)',
        onDelete: 'CASCADE',
      },
      message: {
        type: 'text',
        notNull: true,
      },
      created_at: {
        type: 'timestamp with time zone',
        notNull: true,
        default: pgm.func('CURRENT_TIMESTAMP'),
      },
    });
  
    // Create group_message_reads table to track which users have read which messages
    pgm.createTable('group_message_reads', {
      id: {
        type: 'uuid',
        primaryKey: true,
        default: pgm.func('gen_random_uuid()'),
      },
      message_id: {
        type: 'uuid',
        notNull: true,
        references: 'group_messages(id)',
        onDelete: 'CASCADE',
      },
      user_id: {
        type: 'uuid',
        notNull: true,
        references: 'profiles(user_id)',
        onDelete: 'CASCADE',
      },
      read_at: {
        type: 'timestamp with time zone',
        notNull: true,
        default: pgm.func('CURRENT_TIMESTAMP'),
      },
    });
  
    // Create indexes
    pgm.createIndex('group_messages', 'group_id', { name: 'idx_group_messages_group_id' });
    pgm.createIndex('group_messages', 'sender_id', { name: 'idx_group_messages_sender_id' });
    pgm.createIndex('group_messages', 'created_at', { name: 'idx_group_messages_created_at' });
    pgm.createIndex('group_message_reads', 'message_id', { name: 'idx_group_message_reads_message_id' });
    pgm.createIndex('group_message_reads', 'user_id', { name: 'idx_group_message_reads_user_id' });
  
    // Create unique constraint to prevent duplicate reads
    pgm.createConstraint('group_message_reads', 'unique_message_user', {
      unique: ['message_id', 'user_id'],
    });

  // Migration: 1765416597475_add-slug-and-seo-to-posts.mjs
  // Add slug field for SEO-friendly URLs
    pgm.addColumns('posts', {
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
    pgm.createIndex('posts', 'slug', { name: 'idx_posts_slug' });
  
    // Generate slugs for existing posts based on title
    pgm.sql(`
      UPDATE posts
      SET slug = LOWER(
        REGEXP_REPLACE(
          REGEXP_REPLACE(title, '[^a-zA-Z0-9\\s-]', '', 'g'),
          '\\s+', '-', 'g'
        )
      ) || '-' || SUBSTRING(CAST(id AS TEXT), 1, 8)
      WHERE slug IS NULL;
    `);

  // Migration: 1765416597476_add-slug-and-seo-to-groups.mjs
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

  // Migration: 1765434474069_add-publication-date-to-posts.mjs
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

  // Migration: 1765500119714_add-user-interaction-fields.mjs
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

  // Migration: 1765670877171_add-is-admin-to-profiles.js
  // Add is_admin column to profiles table, default to false
    pgm.addColumn('profiles', {
      is_admin: {
        type: 'boolean',
        notNull: true,
        default: false,
      },
    });
  
    // Create index for faster lookups of admin users
    pgm.createIndex('profiles', 'is_admin', { name: 'idx_profiles_is_admin' });

  // Migration: 1765782763732_add-push-subscriptions.js
  pgm.createTable('push_subscriptions', {
      id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
      user_id: { 
        type: 'uuid', 
        notNull: true, 
        references: 'profiles(user_id)',
        onDelete: 'CASCADE'
      },
      endpoint: { type: 'text', notNull: true, unique: true },
      p256dh: { type: 'text', notNull: true },
      auth: { type: 'text', notNull: true },
      created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
      updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    });
  
    pgm.createIndex('push_subscriptions', 'user_id');
    pgm.createIndex('push_subscriptions', 'endpoint');

};

export const down = async (pgm) => {
  // Rollback: 1765782763732_add-push-subscriptions.js
  pgm.dropTable('push_subscriptions');

  // Rollback: 1765670877171_add-is-admin-to-profiles.js
  // Drop the index
    pgm.dropIndex('profiles', 'is_admin', { name: 'idx_profiles_is_admin', ifExists: true });
  
    // Drop the column
    pgm.dropColumn('profiles', 'is_admin', { ifExists: true });

  // Rollback: 1765500119714_add-user-interaction-fields.mjs
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

  // Rollback: 1765434474069_add-publication-date-to-posts.mjs
  // Drop index
    pgm.dropIndex('posts', 'publication_date', { 
      name: 'idx_posts_publication_date', 
      ifExists: true 
    });
  
    // Drop column
    pgm.dropColumns('posts', ['publication_date']);

  // Rollback: 1765416597476_add-slug-and-seo-to-groups.mjs
  // Drop index
    pgm.dropIndex('groups', 'slug', { name: 'idx_groups_slug', ifExists: true });
  
    // Drop columns
    pgm.dropColumns('groups', ['slug', 'meta_description', 'keywords']);

  // Rollback: 1765416597475_add-slug-and-seo-to-posts.mjs
  // Drop index
    pgm.dropIndex('posts', 'slug', { name: 'idx_posts_slug', ifExists: true });
  
    // Drop columns
    pgm.dropColumns('posts', ['slug', 'meta_description', 'keywords']);

  // Rollback: 1765410922877_create-group-messages-table.mjs
  // Drop constraints
    pgm.dropConstraint('group_message_reads', 'unique_message_user', { ifExists: true });
  
    // Drop indexes
    pgm.dropIndex('group_message_reads', 'user_id', { name: 'idx_group_message_reads_user_id', ifExists: true });
    pgm.dropIndex('group_message_reads', 'message_id', { name: 'idx_group_message_reads_message_id', ifExists: true });
    pgm.dropIndex('group_messages', 'created_at', { name: 'idx_group_messages_created_at', ifExists: true });
    pgm.dropIndex('group_messages', 'sender_id', { name: 'idx_group_messages_sender_id', ifExists: true });
    pgm.dropIndex('group_messages', 'group_id', { name: 'idx_group_messages_group_id', ifExists: true });
  
    // Drop tables
    pgm.dropTable('group_message_reads', { ifExists: true });
    pgm.dropTable('group_messages', { ifExists: true });

  // Rollback: 1765408876568_add-group-images-and-location.mjs
  // Drop indexes
    pgm.dropIndex('group_images', ['group_id', 'display_order'], {
      name: 'idx_group_images_group_order',
      ifExists: true,
    });
    pgm.dropIndex('group_images', 'group_id', { name: 'idx_group_images_group_id', ifExists: true });
    pgm.dropIndex('groups', 'city', { name: 'idx_groups_city', ifExists: true });
    pgm.dropIndex('groups', 'type', { name: 'idx_groups_type', ifExists: true });
  
    // Drop group_images table
    pgm.dropTable('group_images', { ifExists: true });
  
    // Drop new columns from groups table
    pgm.dropColumns('groups', [
      'type',
      'main_image',
      'main_image_public_id',
      'city',
      'latitude',
      'longitude',
    ]);

  // Rollback: 1765407397929_create-groups-table.mjs
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

  // Rollback: 1765268595371_add-new-post-notification-type.mjs
  // Drop the constraint with new_post
    pgm.dropConstraint('notifications', 'notifications_type_check', { ifExists: true });
    
    // Restore the constraint without new_post
    pgm.addConstraint('notifications', 'notifications_type_check', {
      check: "type IN ('friend_request', 'friend_request_accepted', 'message', 'system', 'post_reply')",
    });

  // Rollback: 1765263941426_add-post-reply-notification-type.mjs
  // Drop the constraint with post_reply
    pgm.dropConstraint('notifications', 'notifications_type_check', { ifExists: true });
    
    // Restore the original constraint without post_reply
    pgm.addConstraint('notifications', 'notifications_type_check', {
      check: "type IN ('friend_request', 'friend_request_accepted', 'message', 'system')",
    });

  // Rollback: 1765263807441_create-posts-system.mjs
  // Drop tables in reverse order (respecting foreign key constraints)
    pgm.dropTable('post_views', { ifExists: true });
    pgm.dropTable('post_replies', { ifExists: true });
    pgm.dropTable('post_images', { ifExists: true });
    pgm.dropTable('posts', { ifExists: true });

  // Rollback: 1765192065128_create-user-status-table.mjs
  // Drop table (constraints, indexes, and triggers will be dropped automatically)
    pgm.dropTable('user_status', { ifExists: true });

  // Rollback: 1765192065127_create-notifications-table.mjs
  // Drop table (constraints and indexes will be dropped automatically)
    pgm.dropTable('notifications', { ifExists: true });

  // Rollback: 1765192065126_create-friend-requests-table.mjs
  // Drop table (constraints, indexes, and triggers will be dropped automatically)
    pgm.dropTable('friend_requests', { ifExists: true });

  // Rollback: 1763508426680_create-messages-table.mjs
  // Drop table (constraints and indexes will be dropped automatically)
    pgm.dropTable('messages', { ifExists: true });

  // Rollback: 1763508399593_add-profile-images-table.mjs
  // Drop table (indexes will be dropped automatically)
    pgm.dropTable('profile_images', { ifExists: true });

  // Rollback: 1762991962858_create-friendships-table.mjs
  // Drop table (constraints and indexes will be dropped automatically)
    pgm.dropTable('friendships', { ifExists: true });

  // Rollback: 1762991937827_add-email-name-to-profiles.mjs
  // Drop indexes
    pgm.dropIndex('profiles', 'email', { name: 'idx_profiles_email', ifExists: true });
    pgm.dropIndex('profiles', 'name', { name: 'idx_profiles_name', ifExists: true });
    
    // Drop columns
    pgm.dropColumns('profiles', ['email', 'name']);

  // Rollback: 1699999999999_initial-schema.mjs
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
