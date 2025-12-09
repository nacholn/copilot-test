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
  
  // Add the new check constraint with post_reply included
  pgm.addConstraint('notifications', 'notifications_type_check', {
    check: "type IN ('friend_request', 'friend_request_accepted', 'message', 'system', 'post_reply')",
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  // Drop the constraint with post_reply
  pgm.dropConstraint('notifications', 'notifications_type_check', { ifExists: true });
  
  // Restore the original constraint without post_reply
  pgm.addConstraint('notifications', 'notifications_type_check', {
    check: "type IN ('friend_request', 'friend_request_accepted', 'message', 'system')",
  });
};
