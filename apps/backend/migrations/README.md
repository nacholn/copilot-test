# Database Migrations

This directory contains database migrations for the backend application using [node-pg-migrate](https://salsita.github.io/node-pg-migrate/).

## Overview

Migrations are versioned database schema changes that can be applied (up) or rolled back (down). This ensures database schema is tracked in version control and can be consistently applied across environments.

## Running Migrations

### Prerequisites

Ensure the `DATABASE_URL` environment variable is set in your `.env` file:

```bash
DATABASE_URL=******localhost:5432/cyclists_db
```

### Apply All Pending Migrations

```bash
npm run migrate:up
```

This will apply all migrations that haven't been run yet.

### Rollback Last Migration

```bash
npm run migrate:down
```

This will undo the last migration that was applied.

### Create a New Migration

```bash
npm run migrate:create add-new-feature
```

This creates a new migration file in the `migrations/` directory with a timestamp prefix.

## Migration Structure

Each migration file exports two functions:

- `exports.up`: Defines the changes to apply
- `exports.down`: Defines how to rollback those changes

Example:

```javascript
exports.up = (pgm) => {
  pgm.createTable('example', {
    id: 'id',
    name: { type: 'varchar(100)', notNull: true },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp')
    }
  });
};

exports.down = (pgm) => {
  pgm.dropTable('example');
};
```

## Available Migrations

### 1699999999999_initial-schema.js

Creates the initial database schema:

- **profiles table**: Stores user profile information
  - Fields: id, user_id, level, bike_type, city, latitude, longitude, date_of_birth, avatar, bio
  - Constraints: CHECK constraints on level and bike_type enums
  - Indexes: On user_id, city, level, and bike_type
- **update_updated_at_column function**: Automatically updates the updated_at timestamp
- **update_profiles_updated_at trigger**: Applies the function before updates

## Best Practices

### Creating Migrations

1. **One logical change per migration**: Keep migrations focused on a single feature or change
2. **Always include down migrations**: Ensure changes can be rolled back
3. **Test migrations**: Run both up and down migrations in development before committing
4. **Use transactions**: Migrations run in transactions by default (safe to rollback on error)
5. **Avoid data migrations in schema migrations**: Keep schema and data migrations separate

### Migration Naming

Use descriptive names that explain what the migration does:

```bash
npm run migrate:create add-comments-table
npm run migrate:create add-index-to-profiles
npm run migrate:create alter-user-email-unique
```

### Running in Different Environments

#### Development

```bash
# Set DATABASE_URL in .env
npm run migrate:up
```

#### Production

```bash
# Set DATABASE_URL environment variable
DATABASE_URL=******production-host:5432/prod_db npm run migrate:up
```

#### CI/CD

Include migration runs in your deployment pipeline:

```yaml
# Example GitHub Actions workflow
- name: Run Database Migrations
  run: |
    cd apps/backend
    npm run migrate:up
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## Troubleshooting

### Migration Failed

If a migration fails, it will be rolled back automatically. Check the error message and fix the migration file.

```bash
# View migration status
npm run migrate:up -- --dry-run
```

### Reset Database (Development Only)

To start fresh in development:

```bash
# Rollback all migrations
npm run migrate:down

# Re-apply all migrations
npm run migrate:up
```

### Check Migration Status

```bash
# List applied migrations
npm run migrate:up -- --check
```

### Force a Migration (Use with Caution)

If you need to mark a migration as applied without running it:

```bash
# This is rarely needed and can be dangerous
node-pg-migrate up --fake
```

## Common Operations

### Adding a New Table

```javascript
exports.up = (pgm) => {
  pgm.createTable('rides', {
    id: 'id',
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'profiles(id)',
      onDelete: 'CASCADE'
    },
    title: { type: 'varchar(255)', notNull: true },
    distance: { type: 'decimal(10, 2)' },
    duration: { type: 'integer' },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp')
    }
  });

  pgm.createIndex('rides', 'user_id');
};

exports.down = (pgm) => {
  pgm.dropTable('rides');
};
```

### Adding a Column

```javascript
exports.up = (pgm) => {
  pgm.addColumn('profiles', {
    phone_number: {
      type: 'varchar(20)'
    }
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('profiles', 'phone_number');
};
```

### Creating an Index

```javascript
exports.up = (pgm) => {
  pgm.createIndex('profiles', ['city', 'level'], {
    name: 'idx_profiles_city_level'
  });
};

exports.down = (pgm) => {
  pgm.dropIndex('profiles', ['city', 'level'], {
    name: 'idx_profiles_city_level'
  });
};
```

## References

- [node-pg-migrate Documentation](https://salsita.github.io/node-pg-migrate/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Migration Best Practices](https://salsita.github.io/node-pg-migrate/#best-practices)

## Notes

- Migrations are tracked in the `pgmigrations` table in your database
- Always backup production data before running migrations
- Test migrations thoroughly in staging before production
- Keep migrations in version control
- Never modify migrations that have been applied to production
