# Posts Feature Implementation Guide

## Overview

A complete news posts system for the Bicicita, allowing users to share cycling news with text and images, reply to posts, and receive notifications.

## Features Implemented

### ✅ Database Schema
- **posts**: Main posts table with title, content, visibility (public/friends)
- **post_images**: Multiple images per post stored in Cloudinary
- **post_replies**: Nested comments/replies on posts
- **post_views**: Smart tracking system to show/hide posts based on activity

### ✅ Backend API Endpoints
All endpoints follow REST conventions and include proper error handling:

1. **GET /api/posts** - List posts with filters
   - Query params: `userId`, `showAll` (true/false)
   - Returns posts based on visibility and friendship status
   - Smart filtering for "unread" posts with new activity

2. **POST /api/posts** - Create new post
   - Accepts multipart/form-data with images
   - Uploads images to Cloudinary
   - Supports public/friends visibility

3. **GET /api/posts/[postId]/replies** - Get post replies
   - Returns all replies with author information
   - Ordered chronologically

4. **POST /api/posts/[postId]/replies** - Create reply
   - Sends notifications to post author and other participants
   - Integrates with WebSocket for real-time updates

5. **POST /api/posts/[postId]/view** - Mark post as viewed
   - Tracks reply count at time of viewing
   - Enables smart re-showing logic

### ✅ Frontend Pages

1. **`/posts`** - Posts List
   - Toggle between "Show All" and "Show Unread"
   - Responsive card grid layout
   - Shows post preview with first image
   - Displays author, reply count, visibility badge

2. **`/posts/create`** - Create Post
   - Multi-image upload (up to 5 images)
   - Image preview with removal
   - Public/Friends visibility selector
   - Form validation

3. **`/posts/[postId]`** - Post Detail
   - Full post content with all images
   - Image gallery with thumbnails
   - Reply form and list
   - Real-time reply updates

### ✅ Smart Visibility Logic

Posts are shown in the "unread" feed when:
- User hasn't viewed the post yet
- User created the post AND there are new replies
- User replied to the post AND there are new replies from others

This prevents post fatigue while keeping users engaged with active discussions.

### ✅ Notification System

Integrated with existing WebSocket notifications:
- Author notified when someone replies
- All participants notified of new replies
- Click notification to go directly to post
- New notification type: `post_reply`

### ✅ Internationalization

Full translations in three languages:
- **English** (en)
- **Spanish** (es) 
- **French** (fr)

Translation keys added for:
- Navigation ("Posts")
- Post list (filters, badges, empty states)
- Post creation form (labels, buttons, validation)
- Post detail (replies, actions)

## Database Migration

To apply the database schema:

```bash
cd apps/backend
npm run migrate:up
```

This will create:
1. `posts` table
2. `post_images` table
3. `post_replies` table
4. `post_views` table
5. Update notifications constraint to include `post_reply`

## Testing Guide

### Manual Testing Steps

1. **Create a Post**
   - Login as a user
   - Navigate to `/posts`
   - Click "Create Post"
   - Fill in title, content, select images
   - Choose visibility (public/friends)
   - Submit and verify redirect to posts list

2. **View Posts List**
   - Verify new post appears
   - Check "Show All" vs "Show Unread" toggle
   - Verify visibility badges (🌍 public, 👥 friends)
   - Check image thumbnail displays

3. **View Post Detail**
   - Click on a post card
   - Verify all images display
   - Test image gallery navigation
   - Check author info and date

4. **Reply to Post**
   - Type a reply in the form
   - Submit and verify it appears
   - Check notification sent to post author
   - Verify WebSocket real-time update

5. **Smart Re-showing**
   - View a post (marks as viewed)
   - Go back to list - post should disappear from "unread"
   - Have another user reply to that post
   - Return to list - post should reappear with "New" badge

6. **Friendships Integration**
   - Create a "friends only" post
   - Login as non-friend - post should not appear
   - Login as friend - post should appear
   - Verify public posts visible to all

### API Testing with curl

```bash
# Get posts (replace USER_ID)
curl "http://localhost:3001/api/posts?userId=USER_ID&showAll=false"

# Create post (multipart form-data)
curl -X POST "http://localhost:3001/api/posts" \
  -F "userId=USER_ID" \
  -F "title=Test Post" \
  -F "content=This is test content" \
  -F "visibility=public" \
  -F "images=@/path/to/image.jpg"

# Get replies
curl "http://localhost:3001/api/posts/POST_ID/replies"

# Create reply
curl -X POST "http://localhost:3001/api/posts/POST_ID/replies" \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID","content":"Great post!"}'

# Mark as viewed
curl -X POST "http://localhost:3001/api/posts/POST_ID/view" \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID"}'
```

## Code Quality

### Linting
```bash
# Backend
cd apps/backend && npm run lint  # ✓ Passed

# Web
cd apps/web && npm run lint  # ✓ Passed with minor warnings
```

### Build
```bash
# Config package (required first)
cd packages/config && npm run build

# Backend
cd apps/backend && npm run build  # ✓ Compiled successfully

# Web
cd apps/web && npm run build  # ✓ Compiled successfully
```

## Design Patterns Used

1. **Consistent API Response Format**
   ```typescript
   { success: boolean, data?: T, error?: string }
   ```

2. **TypeScript Types**
   - Centralized in `packages/config/src/types.ts`
   - Shared between frontend and backend
   - Proper type safety throughout

3. **CSS Modules**
   - Scoped styles per component
   - Consistent naming conventions
   - Responsive design (mobile, tablet, desktop)

4. **Error Handling**
   - Try-catch blocks on all async operations
   - User-friendly error messages
   - Console logging for debugging

5. **Authentication Guards**
   - All pages wrapped in `AuthGuard`
   - API endpoints validate user IDs
   - Proper authorization checks

## Performance Considerations

1. **Database Indexes**
   - All foreign keys indexed
   - Composite indexes for common queries
   - Created_at indexes for sorting

2. **Image Optimization**
   - Cloudinary transformations
   - Automatic format optimization
   - Quality: auto:good
   - Lazy loading ready

3. **Query Optimization**
   - Single query for posts with counts
   - Left joins to avoid N+1 problems
   - Efficient filtering with WHERE clauses

## Security

1. **Input Validation**
   - All user inputs sanitized
   - File size limits (10MB per image)
   - Max 5 images per post
   - SQL injection prevention with parameterized queries

2. **Authorization**
   - Friends-only posts respect friendship table
   - User can only view permitted posts
   - Proper user ID validation

3. **Image Upload**
   - Cloudinary signed uploads
   - File type validation
   - Secure URL generation

## Future Enhancements

Potential improvements for future iterations:

1. **Rich Text Editor**
   - Markdown support
   - Formatting options
   - Code snippets

2. **Post Reactions**
   - Like/love/celebrate reactions
   - Reaction counts and lists

3. **Post Editing**
   - Edit post content
   - Edit history tracking
   - Image reordering

4. **Advanced Search**
   - Search by keywords
   - Filter by author
   - Date range filtering

5. **Post Categories/Tags**
   - Categorize cycling news
   - Tag-based filtering
   - Popular tags widget

6. **Share Functionality**
   - Share to social media
   - Copy link to clipboard
   - Email sharing

## Troubleshooting

### Images not uploading
- Check Cloudinary credentials in env vars
- Verify file size < 10MB
- Check file format (PNG, JPG, GIF)

### Posts not appearing
- Verify user authentication
- Check friendship status for friends-only posts
- Ensure migrations are applied

### Notifications not working
- Check WebSocket connection
- Verify Socket.IO server is running
- Check browser console for errors

### Build failures
- Run `npm install` in root directory
- Build packages in order: config → backend/web
- Check for TypeScript errors

## Files Modified/Created

### Created Files
- `apps/backend/migrations/1765263807441_create-posts-system.mjs`
- `apps/backend/migrations/1765263941426_add-post-reply-notification-type.mjs`
- `apps/backend/src/app/api/posts/route.ts`
- `apps/backend/src/app/api/posts/[postId]/replies/route.ts`
- `apps/backend/src/app/api/posts/[postId]/view/route.ts`
- `apps/web/src/app/posts/page.tsx`
- `apps/web/src/app/posts/posts.module.css`
- `apps/web/src/app/posts/create/page.tsx`
- `apps/web/src/app/posts/create/create.module.css`
- `apps/web/src/app/posts/[postId]/page.tsx`
- `apps/web/src/app/posts/[postId]/post-detail.module.css`

### Modified Files
- `packages/config/src/types.ts` - Added post-related types
- `apps/web/src/components/Header.tsx` - Added Posts link
- `apps/web/src/messages/en.json` - Added English translations
- `apps/web/src/messages/es.json` - Added Spanish translations
- `apps/web/src/messages/fr.json` - Added French translations
- `apps/web/src/i18n.ts` - Fixed TypeScript type issue

## Support

For questions or issues with this feature:
1. Check this documentation first
2. Review the code comments in the implementation
3. Check the main project README.md
4. Consult the ARCHITECTURE.md for overall project structure
