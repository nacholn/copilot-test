# Public Pages and SEO Implementation Guide

This guide documents the new public pages feature with SEO optimization for posts and groups in the Cyclists Social Network application.

## Overview

The application now includes public-facing pages for posts and groups, optimized for search engines. These pages are accessible without authentication and include SEO-friendly URLs (slugs), meta tags, and social media sharing optimization.

## Features

### 1. SEO-Friendly URLs (Slugs)

Both posts and groups now have unique, SEO-friendly URL slugs:

- **Posts**: `/p/{slug}` (e.g., `/p/my-awesome-cycling-adventure-a1b2c3d4`)
- **Groups**: `/g/{slug}` (e.g., `/g/mountain-bikers-madrid-e5f6g7h8`)

Slugs are automatically generated from the title/name and include a unique identifier to ensure uniqueness.

### 2. Enhanced Home Page

The home page now displays:

- Latest 6 public posts in a card grid
- Top 6 popular groups (by member count) in a card grid
- Direct links to view all posts and groups

### 3. Public Post Detail Pages

**URL Pattern**: `/p/[slug]`

**Features**:

- Full post content display
- Author information with avatar
- Image gallery (if post has images)
- Reply count display
- "Reply" button that redirects to login if not authenticated
- SEO meta tags (title, description, Open Graph, Twitter Cards)
- Login prompt for unauthenticated users

**SEO Optimization**:

```html
<title>{Post Title} | Cyclists Social Network</title>
<meta name="description" content="{meta_description or content excerpt}" />
<meta name="keywords" content="{keywords}" />
<meta property="og:title" content="{Post Title}" />
<meta property="og:description" content="{meta_description}" />
<meta property="og:image" content="{first_image_url}" />
<meta property="og:type" content="article" />
```

### 4. Public Group Detail Pages

**URL Pattern**: `/g/[slug]`

**Features**:

- Group cover image
- Group name, description, and metadata
- Member count display
- Group type indicator (Location-based or General)
- Photo gallery (if group has additional images)
- "Join" button that redirects to login if not authenticated
- SEO meta tags (title, description, Open Graph, Twitter Cards)
- Login prompt for unauthenticated users

**SEO Optimization**:

```html
<title>{Group Name} | Cyclists Social Network</title>
<meta name="description" content="{meta_description or description}" />
<meta name="keywords" content="{keywords}" />
<meta property="og:title" content="{Group Name}" />
<meta property="og:description" content="{meta_description}" />
<meta property="og:image" content="{main_image}" />
<meta property="og:type" content="website" />
```

## Database Changes

### New Fields for Posts Table

```sql
slug VARCHAR(255) NOT NULL UNIQUE  -- SEO-friendly URL
meta_description VARCHAR(500)      -- Meta description for SEO
keywords TEXT                      -- Comma-separated keywords
```

### New Fields for Groups Table

```sql
slug VARCHAR(255) NOT NULL UNIQUE  -- SEO-friendly URL
meta_description VARCHAR(500)      -- Meta description for SEO
keywords TEXT                      -- Comma-separated keywords
```

### Indexes

```sql
-- For fast slug lookups
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_groups_slug ON groups(slug);
```

## API Endpoints

### Public Posts API

#### Get Latest Public Posts

```
GET /api/posts/public?limit=10&offset=0
```

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Post Title",
      "content": "Post content...",
      "slug": "post-title-a1b2c3d4",
      "metaDescription": "SEO description",
      "keywords": "cycling, adventure, tips",
      "authorName": "John Doe",
      "authorAvatar": "https://...",
      "images": [...],
      "replyCount": 5,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Get Post by Slug

```
GET /api/posts/slug/{slug}
```

### Public Groups API

#### Get Public Groups

```
GET /api/groups/public?limit=10&offset=0&orderBy=created_at
```

**Query Parameters**:

- `limit`: Number of results (default: 10)
- `offset`: Pagination offset (default: 0)
- `orderBy`: Sort order - `created_at` or `member_count` (default: `created_at`)

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Group Name",
      "description": "Group description...",
      "slug": "group-name-e5f6g7h8",
      "metaDescription": "SEO description",
      "keywords": "cycling, community, local",
      "type": "location",
      "city": "Madrid",
      "mainImage": "https://...",
      "memberCount": 150,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Get Group by Slug

```
GET /api/groups/slug/{slug}
```

## Running Migrations

To apply the new database schema changes:

```bash
cd apps/backend
npm run migrate:up
```

This will:

1. Add slug, meta_description, and keywords fields to posts and groups
2. Generate slugs for existing posts and groups
3. Create indexes for fast slug lookups

## Usage Examples

### Creating a Post with SEO Fields

When creating a post through the API, you can now include SEO fields:

```javascript
const formData = new FormData();
formData.append('userId', userId);
formData.append('title', 'My Cycling Adventure');
formData.append('content', 'Today I went on an amazing ride...');
formData.append('visibility', 'public');
formData.append('metaDescription', 'Join me as I explore the beautiful mountain trails...');
formData.append('keywords', 'cycling, mountain biking, adventure, trails');
// Add images...

await fetch(`${apiUrl}/api/posts`, {
  method: 'POST',
  body: formData,
});
```

The API will automatically generate a slug like: `my-cycling-adventure-a1b2c3d4`

### Creating a Group with SEO Fields

```javascript
await fetch(`${apiUrl}/api/groups`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Mountain Bikers Madrid',
    description: 'A community for mountain biking enthusiasts in Madrid',
    type: 'location',
    city: 'Madrid',
    metaDescription: 'Join the largest mountain biking community in Madrid',
    keywords: 'mountain biking, Madrid, cycling, trails, community',
  }),
});
```

The API will automatically generate a slug like: `mountain-bikers-madrid-e5f6g7h8`

## SEO Best Practices Implemented

### 1. URL Structure

- Clean, readable URLs with slugs
- Short unique identifier appended to prevent conflicts
- No special characters or spaces

### 2. Meta Tags

- Descriptive title tags with site name
- Meta descriptions (150-160 characters recommended)
- Keywords for content classification

### 3. Open Graph (Facebook, LinkedIn)

- `og:title` - Page title
- `og:description` - Page description
- `og:image` - Featured image
- `og:type` - Content type (article for posts, website for groups)

### 4. Twitter Cards

- `twitter:card` - Summary with large image
- `twitter:title` - Page title
- `twitter:description` - Page description
- `twitter:image` - Featured image

### 5. Content Structure

- Proper heading hierarchy (H1 for title)
- Semantic HTML5 elements (article, header, etc.)
- Alt text for images
- Readable content length

## Components

### PublicPostCard

Displays a post preview card with:

- Featured image
- Title and excerpt
- Author information
- Reply count
- Link to full post

### PublicGroupCard

Displays a group preview card with:

- Cover image
- Group name and description excerpt
- Type indicator (location/general)
- City name (for location-based groups)
- Member count
- Link to group detail

## Accessibility

All public pages include:

- Semantic HTML structure
- Proper heading hierarchy
- Alt text for images
- Keyboard navigation support
- ARIA labels where appropriate

## Mobile Responsiveness

All pages are fully responsive:

- Mobile-first design approach
- Responsive grid layouts
- Touch-friendly buttons and links
- Optimized images for different screen sizes

## Future Enhancements

Potential improvements:

1. **Sitemap Generation**: Auto-generate XML sitemap for search engines
2. **Canonical URLs**: Add canonical tags for duplicate content prevention
3. **Schema.org Markup**: Add structured data for rich snippets
4. **RSS Feeds**: Generate RSS feeds for posts
5. **Social Sharing Buttons**: Add share buttons on detail pages
6. **Pagination**: Implement SEO-friendly pagination for post/group lists
7. **Breadcrumbs**: Add breadcrumb navigation for better SEO

## Testing SEO

### Tools to Test SEO Implementation:

1. **Google Search Console**: Submit sitemap and monitor indexing
2. **Google PageSpeed Insights**: Test performance
3. **Facebook Sharing Debugger**: Test Open Graph tags
4. **Twitter Card Validator**: Test Twitter Cards
5. **Lighthouse**: Audit SEO, accessibility, and performance

### Manual Testing:

1. Visit `/p/[any-post-slug]` - Verify post content displays correctly
2. Visit `/g/[any-group-slug]` - Verify group information displays correctly
3. Test login redirect by clicking "Reply" or "Join" when not logged in
4. View page source to verify meta tags are present
5. Test social sharing on Facebook/Twitter to verify preview

## Troubleshooting

### Slug Conflicts

If you encounter slug conflicts, the system will return an error. Slugs are unique and automatically generated with a short UUID suffix to prevent conflicts.

### Missing Meta Tags

If meta tags are not appearing, ensure:

1. The post/group has metaDescription and keywords set
2. The page is not cached
3. You're viewing the page source (not inspecting elements)

### Images Not Loading

Ensure:

1. Cloudinary credentials are properly configured
2. Image URLs are accessible
3. CORS is properly configured for image domains

## Support

For issues or questions:

1. Check the main README.md for setup instructions
2. Review this guide for SEO-specific features
3. Open a GitHub issue with details about the problem
