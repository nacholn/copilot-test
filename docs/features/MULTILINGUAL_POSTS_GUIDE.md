# Multilingual Posts Feature Guide

## Overview

The Multilingual Posts feature allows users to create posts with content in multiple languages (English, Spanish, and French). Posts use PostgreSQL JSONB columns for flexible, performant storage and retrieval of multilingual content.

## Features

- **Multiple Language Support**: Create posts in English (en), Spanish (es), and French (fr)
- **Language Switcher**: View posts in any available language
- **Flexible Storage**: Uses PostgreSQL JSONB for efficient storage
- **Type-Safe**: Full TypeScript support with shared types
- **RESTful API**: Complete CRUD operations for multilingual posts
- **Fallback System**: Automatic fallback to available languages

## Architecture

### Database Schema

The `multilingual_posts` table includes:

- **id**: UUID primary key
- **author_id**: UUID reference to profiles
- **title**: JSONB column storing titles in multiple languages
- **content**: JSONB column storing content in multiple languages
- **default_language**: VARCHAR(5) - default language preference
- **available_languages**: TEXT[] - array of available languages
- **created_at**: Timestamp with timezone
- **updated_at**: Timestamp with timezone (auto-updated via trigger)

The schema includes:
- GIN indexes on JSONB columns for performance
- Constraints ensuring title and content are not empty
- Automatic updated_at trigger
- Cascade delete on author deletion

### TypeScript Types

Located in `packages/config/src/types.ts`:

```typescript
export type SupportedLanguage = 'en' | 'es' | 'fr';

export interface MultilingualText {
  en?: string;
  es?: string;
  fr?: string;
}

export interface MultilingualPost {
  id: string;
  author_id: string;
  title: MultilingualText;
  content: MultilingualText;
  default_language: SupportedLanguage;
  available_languages: SupportedLanguage[];
  created_at: string;
  updated_at: string;
}
```

### i18n Utilities

Located in `packages/config/src/utils/i18n.ts`:

- **getLocalizedText()**: Get text in preferred language with fallback
- **hasTranslation()**: Check if text has translation for a language
- **getAvailableLanguages()**: Get all available languages for text
- **validateMultilingualText()**: Validate that at least one language is provided

## API Endpoints

### Create Post

```
POST /api/multilingual-posts
```

**Request Body:**
```json
{
  "title": {
    "en": "My Cycling Adventure",
    "es": "Mi Aventura en Bicicleta",
    "fr": "Mon Aventure à Vélo"
  },
  "content": {
    "en": "Today I went on an amazing ride...",
    "es": "Hoy fui a un paseo increíble...",
    "fr": "Aujourd'hui, j'ai fait une balade incroyable..."
  },
  "default_language": "en"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "author_id": "uuid",
    "title": { ... },
    "content": { ... },
    "default_language": "en",
    "available_languages": ["en", "es", "fr"],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### List Posts

```
GET /api/multilingual-posts?language=es
```

Query parameters:
- `language` (optional): Filter posts by available language

### Get Single Post

```
GET /api/multilingual-posts/:id
```

### Update Post

```
PATCH /api/multilingual-posts/:id
```

**Request Body:**
```json
{
  "title": {
    "en": "Updated Title"
  },
  "default_language": "es"
}
```

Note: Available languages are automatically recalculated when title or content changes.

### Delete Post

```
DELETE /api/multilingual-posts/:id
```

## Frontend Components

### MultilingualPostCard

Displays a post with language switcher buttons.

**Usage:**
```tsx
import { MultilingualPostCard } from '@/components/posts/MultilingualPostCard';

<MultilingualPostCard 
  post={post} 
  userLanguage="en" 
/>
```

**Features:**
- Language switcher buttons for each available language
- Displays title and content in selected language
- Shows default language metadata

### CreateMultilingualPostForm

Form for creating multilingual posts.

**Usage:**
```tsx
import { CreateMultilingualPostForm } from '@/components/forms/CreateMultilingualPostForm';

<CreateMultilingualPostForm />
```

**Features:**
- Input fields for all three supported languages
- Default language selector
- Validation (requires at least one common language)
- Success/error feedback
- Automatic cleanup of empty fields

## Usage Examples

### Creating a Post

```typescript
const response = await fetch('/api/multilingual-posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: {
      en: 'My Post',
      es: 'Mi Publicación'
    },
    content: {
      en: 'Content here...',
      es: 'Contenido aquí...'
    },
    default_language: 'en'
  })
});
```

### Using i18n Utilities

```typescript
import { getLocalizedText, getAvailableLanguages } from '@cyclists/config';

// Get text in user's language with fallback
const title = getLocalizedText(post.title, userLanguage);

// Get all available languages
const languages = getAvailableLanguages(post.content);
```

## Validation Rules

1. **At least one language required**: Both title and content must have at least one language
2. **Common languages**: Title and content must share at least one common language
3. **Empty strings filtered**: Empty translations are automatically removed
4. **Available languages calculation**: Intersection of title and content languages

## Database Migration

The migration is located at:
```
apps/backend/migrations/1765927896789_create-multilingual-posts-table.mjs
```

To apply the migration:
```bash
cd apps/backend
npm run migrate:up
```

To rollback:
```bash
cd apps/backend
npm run migrate:down
```

## Future Enhancements

Potential improvements for future releases:

1. **Rich Text Editor**: Support for formatted content
2. **Search**: Full-text search across all languages
3. **Auto-Translation**: Integration with translation APIs
4. **More Languages**: Expand beyond en/es/fr
5. **Language Detection**: Automatic detection from browser settings
6. **Version History**: Track changes to translations over time

## Testing

### Unit Tests

i18n utility tests are located at:
```
packages/config/src/utils/__tests__/i18n.test.ts
```

Run tests:
```bash
cd packages/config
npm test
```

### Manual Testing

1. Create a post with multiple languages
2. Verify language switcher works
3. Test with only one language
4. Test validation errors
5. Verify fallback behavior
6. Test update and delete operations

## Performance Considerations

- **GIN Indexes**: JSONB columns are indexed for fast queries
- **Array Indexing**: available_languages array is GIN indexed
- **Efficient Queries**: Only fetch necessary fields
- **Language Filtering**: Efficient array containment queries

## Security Notes

- Uses parameterized queries to prevent SQL injection
- Validates all input before processing
- Author authentication required (to be implemented)
- Cascade delete ensures data consistency
