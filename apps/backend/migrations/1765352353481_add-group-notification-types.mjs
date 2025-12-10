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
  // Add new notification types for groups
  pgm.sql(`
    ALTER TABLE notifications
    DROP CONSTRAINT IF EXISTS notifications_type_check;
  `);

  pgm.sql(`
    ALTER TABLE notifications
    ADD CONSTRAINT notifications_type_check
    CHECK (type IN (
      'friend_request',
      'friend_request_accepted',
      'message',
      'system',
      'post_reply',
      'new_post',
      'group_message',
      'group_invitation',
      'group_member_joined'
    ));
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  // Revert to previous notification types
  pgm.sql(`
    ALTER TABLE notifications
    DROP CONSTRAINT IF EXISTS notifications_type_check;
  `);

  pgm.sql(`
    ALTER TABLE notifications
    ADD CONSTRAINT notifications_type_check
    CHECK (type IN (
      'friend_request',
      'friend_request_accepted',
      'message',
      'system',
      'post_reply',
      'new_post'
    ));
  `);
};
