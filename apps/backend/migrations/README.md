# Database Migrations

## Consolidated Migration

All database migrations have been consolidated into a single file: `1700000000000_consolidated-schema.mjs`

This file contains all the schema changes from the original 20 individual migration files, combined in chronological order.

### Original Migrations (Archived)

The original migration files have been moved to `migrations_backup/` for reference:

1. `1699999999999_initial-schema.mjs` - Initial profiles table
2. `1762991937827_add-email-name-to-profiles.mjs` - Add email and name fields
3. `1762991962858_create-friendships-table.mjs` - Friendships table
4. `1763508399593_add-profile-images-table.mjs` - Profile images
5. `1763508426680_create-messages-table.mjs` - Messages table
6. `1765192065126_create-friend-requests-table.mjs` - Friend requests
7. `1765192065127_create-notifications-table.mjs` - Notifications
8. `1765192065128_create-user-status-table.mjs` - User status
9. `1765263807441_create-posts-system.mjs` - Posts system
10. `1765263941426_add-post-reply-notification-type.mjs` - Post reply notifications
11. `1765268595371_add-new-post-notification-type.mjs` - New post notifications
12. `1765407397929_create-groups-table.mjs` - Groups table
13. `1765408876568_add-group-images-and-location.mjs` - Group images and location
14. `1765410922877_create-group-messages-table.mjs` - Group messages
15. `1765416597475_add-slug-and-seo-to-posts.mjs` - Post slugs and SEO
16. `1765416597476_add-slug-and-seo-to-groups.mjs` - Group slugs and SEO
17. `1765434474069_add-publication-date-to-posts.mjs` - Publication dates
18. `1765500119714_add-user-interaction-fields.mjs` - User interaction tracking
19. `1765670877171_add-is-admin-to-profiles.js` - Admin flag
20. `1765782763732_add-push-subscriptions.js` - Push subscriptions

### Running Migrations

To apply the consolidated migration:

```bash
npm run migrate:up
```

To rollback:

```bash
npm run migrate:down
```

### Benefits of Consolidation

- **Simpler management**: Single file instead of 20+ files
- **Faster execution**: All migrations run in a single transaction
- **Easier understanding**: Complete schema visible in one place
- **Reduced complexity**: No need to track multiple migration states
