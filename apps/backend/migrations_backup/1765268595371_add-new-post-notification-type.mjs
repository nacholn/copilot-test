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
  // Drop the existing check constraint
  pgm.dropConstraint('notifications', 'notifications_type_check', { ifExists: true });
  
  // Add the new check constraint with new_post included
  pgm.addConstraint('notifications', 'notifications_type_check', {
    check: "type IN ('friend_request', 'friend_request_accepted', 'message', 'system', 'post_reply', 'new_post')",
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  // Drop the constraint with new_post
  pgm.dropConstraint('notifications', 'notifications_type_check', { ifExists: true });
  
  // Restore the constraint without new_post
  pgm.addConstraint('notifications', 'notifications_type_check', {
    check: "type IN ('friend_request', 'friend_request_accepted', 'message', 'system', 'post_reply')",
  });
};
