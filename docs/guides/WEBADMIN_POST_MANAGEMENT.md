# WebAdmin Post Management Guide

## Overview

This guide documents the WebAdmin functionality for managing post SEO fields and publication dates, implemented based on user feedback.

## Key Features

### 1. SEO Fields Management

**Restriction**: SEO fields can ONLY be edited from WebAdmin, not during regular post creation.

**Fields**:

- **Meta Description**: Up to 500 characters (recommended 150-160 for SEO)
- **Keywords**: Comma-separated list of relevant keywords

**Why**: This ensures content quality and SEO optimization are managed by administrators, preventing users from adding inappropriate or poorly optimized metadata.

### 2. Publication Date Field

**Purpose**: Control when posts appear publicly, especially for scheduled content.

**Behavior**:

- **Friends Posts**: Automatically set to current date on creation
- **Public Posts**: Must be manually set from WebAdmin before publication

**Use Cases**:

- Schedule future posts by setting a future publication date
- Backdate posts for historical content
- Control public visibility timing

## Accessing WebAdmin

### Starting WebAdmin

```bash
# From project root
npm run dev
```

Then navigate to: `http://localhost:3002`

### Navigation

WebAdmin includes navigation between:

- **Groups** (Home page) - Manage cycling groups
- **Posts** (New) - Manage post SEO and publication dates

## Using the Posts Management Interface

### 1. Viewing Posts

**Filter Options**:

- **All Posts**: Shows all posts regardless of visibility
- **Public Posts**: Shows only posts visible to everyone
- **Friends Posts**: Shows only posts visible to friends

**Post Information Displayed**:

- Title and content excerpt
- Author name
- Visibility badge (public/friends)
- URL slug
- Creation date
- Publication date (if set)
- Current SEO settings (description and keywords)

### 2. Editing Post SEO and Publication Date

**Steps**:

1. Click "Edit SEO & Publication Date" button on any post card
2. Modal opens with three sections:

**Post Information Section**:

- Displays read-only post details (title, visibility, slug)

**Meta Description Section**:

- Text area with 500 character limit
- Shows current character count
- Recommended: 150-160 characters for optimal SEO
- Leave empty if SEO description not needed yet

**Keywords Section**:

- Single-line text input
- Enter comma-separated keywords
- Example: `cycling, adventure, tips, mountain biking`

**Publication Date Section**:

- Date picker input
- Shows hint based on post visibility:
  - Public posts: "Required for public posts"
  - Friends posts: "Optional (auto-set for friends posts)"
- Can be set to past, present, or future dates

3. Click "Update Post" to save changes
4. Changes are applied immediately

### 3. Best Practices

**Meta Descriptions**:

- Keep between 150-160 characters for Google search results
- Make it compelling - users see this in search results
- Include relevant keywords naturally
- Describe what the post is about

**Keywords**:

- Use 3-8 relevant keywords
- Mix general and specific terms
- Separate with commas
- Example: `cycling, road bikes, training tips, beginner`

**Publication Dates**:

- For public posts, always set before making visible
- Use future dates to schedule content
- Ensure date makes sense with post content

## API Endpoints

### Get All Posts (WebAdmin)

```http
GET /api/webadmin/posts?limit=50&offset=0&visibility=public
```

**Query Parameters**:

- `limit` (optional): Number of results, default 50
- `offset` (optional): Pagination offset, default 0
- `visibility` (optional): Filter by 'public' or 'friends'

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Post Title",
      "content": "Post content...",
      "visibility": "public",
      "slug": "post-title-a1b2c3d4",
      "metaDescription": "SEO description",
      "keywords": "keyword1, keyword2",
      "publicationDate": "2024-12-11T00:00:00.000Z",
      "authorName": "John Doe",
      "replyCount": 5,
      "createdAt": "2024-12-10T00:00:00.000Z",
      "updatedAt": "2024-12-11T00:00:00.000Z"
    }
  ]
}
```

### Update Post SEO Fields

```http
PATCH /api/webadmin/posts/:postId
Content-Type: application/json

{
  "metaDescription": "New meta description for SEO",
  "keywords": "new, keywords, here",
  "publicationDate": "2024-12-15T00:00:00.000Z"
}
```

**Notes**:

- All fields are optional - only send fields you want to update
- Set field to `null` to clear it
- `publicationDate` must be valid ISO 8601 date string or null

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Post Title",
    "slug": "post-title-a1b2c3d4",
    "metaDescription": "New meta description for SEO",
    "keywords": "new, keywords, here",
    "publicationDate": "2024-12-15T00:00:00.000Z",
    ...
  }
}
```

## Database Schema

### Publication Date Field

```sql
ALTER TABLE posts ADD COLUMN publication_date TIMESTAMP WITH TIME ZONE;

CREATE INDEX idx_posts_publication_date ON posts(publication_date)
WHERE publication_date IS NOT NULL;
```

**Field Details**:

- **Type**: `timestamp with time zone`
- **Nullable**: Yes (optional)
- **Indexed**: Yes, for efficient sorting
- **Auto-populated**: For friends posts on creation

## Regular Post Creation (Users)

When users create posts through the regular API (`/api/posts`), they **cannot** set:

- `metaDescription`
- `keywords`
- `publicationDate` (except auto-set for friends posts)

**Example - Regular Post Creation**:

```javascript
const formData = new FormData();
formData.append('userId', userId);
formData.append('title', 'My Cycling Adventure');
formData.append('content', 'Today I went on an amazing ride...');
formData.append('visibility', 'public'); // or 'friends'
// Note: No SEO fields allowed here

await fetch(`${apiUrl}/api/posts`, {
  method: 'POST',
  body: formData,
});
```

**What Happens**:

1. Post is created with title, content, visibility
2. Slug is auto-generated from title
3. For friends posts: `publication_date` is set to current timestamp
4. For public posts: `publication_date` remains NULL (must be set from WebAdmin)

## Security Considerations

1. **WebAdmin Authentication**: In production, add authentication to WebAdmin routes
2. **CSRF Protection**: Implement CSRF tokens for WebAdmin forms
3. **Rate Limiting**: Add rate limiting to prevent abuse
4. **Input Validation**: Already implemented - validates all inputs
5. **SQL Injection**: All queries use parameterized statements

## Troubleshooting

### Posts not appearing in public pages?

Check if:

1. Post visibility is set to 'public'
2. Publication date is set (required for public posts)
3. Publication date is not in the future

### Cannot update SEO fields from regular app?

This is expected behavior. SEO fields are WebAdmin-only to maintain content quality.

### Publication date not auto-setting for friends posts?

Ensure you're using the latest migration:

```bash
cd apps/backend
npm run migrate:up
```

### WebAdmin not starting?

Check that port 3002 is available:

```bash
lsof -i :3002  # Check if port is in use
```

Or specify a different port:

```bash
cd apps/webadmin
PORT=3003 npm run dev
```

## Migration Instructions

### Apply New Schema

```bash
cd apps/backend
npm run migrate:up
```

This will:

1. Add `publication_date` column to posts table
2. Create index on `publication_date`
3. Auto-populate `publication_date` for existing friends posts

### Rollback (if needed)

```bash
cd apps/backend
npm run migrate:down
```

## Future Enhancements

Potential improvements:

1. **Bulk Operations**: Update multiple posts at once
2. **SEO Score**: Show SEO optimization score for each post
3. **Scheduled Publishing**: Automatically publish when publication_date arrives
4. **Preview**: Preview how post appears in search results
5. **History**: Track changes to SEO fields over time
6. **Suggestions**: AI-powered SEO suggestions
7. **Analytics**: Track which SEO optimizations perform best

## Support

For issues or questions:

1. Check this documentation
2. Review PUBLIC_PAGES_SEO_GUIDE.md for SEO details
3. Check the main README.md for setup instructions
4. Open a GitHub issue with details
