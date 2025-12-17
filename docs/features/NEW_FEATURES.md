# New Features Implementation Guide

This document describes the new features added to the Bicicita application.

## 🖼️ Cloudinary Integration for Image Storage

### Overview
Profile images are now stored using Cloudinary instead of just URLs. This provides:
- Automatic image optimization
- Multiple image support per profile
- Image transformations (resize, crop, quality)
- Secure cloud storage

### Configuration

#### Backend Environment Variables
Add the following to `apps/backend/.env`:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

To get these credentials:
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard
3. Copy Cloud Name, API Key, and API Secret

### Database Changes

A new `profile_images` table has been added to support multiple images per profile:

```sql
CREATE TABLE profile_images (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(user_id),
  image_url TEXT NOT NULL,
  cloudinary_public_id TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

Run migrations to create this table:
```bash
cd apps/backend
npm run migrate:up
```

### API Endpoints

#### Upload Profile Image
```
POST /api/profile/images
Content-Type: multipart/form-data

Body:
- userId: string
- isPrimary: boolean (optional)
- file: File
```

#### Get Profile Images
```
GET /api/profile/images?userId={userId}
```

#### Delete Profile Image
```
DELETE /api/profile/images?imageId={id}&userId={userId}
```

#### Set Image as Primary
```
PATCH /api/profile/images?imageId={id}&userId={userId}
Body: { isPrimary: true }
```

### Usage Example

```typescript
// Upload an image
const formData = new FormData();
formData.append('userId', user.id);
formData.append('isPrimary', 'true');
formData.append('file', fileInput.files[0]);

const response = await fetch('/api/profile/images', {
  method: 'POST',
  body: formData,
});
```

## 💬 Friend Chat System

### Overview
Users can now send and receive messages with their friends in real-time.

### Database Changes

A new `messages` table has been added:

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  sender_id UUID REFERENCES profiles(user_id),
  receiver_id UUID REFERENCES profiles(user_id),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

Run migrations to create this table:
```bash
cd apps/backend
npm run migrate:up
```

### Features

- **Conversations List**: See all your friends and recent messages
- **Unread Count**: Visual indicator of unread messages
- **Real-time Updates**: Messages refresh every 3 seconds
- **Read Receipts**: Messages automatically marked as read when viewed
- **Responsive Design**: Works on mobile, tablet, and desktop

### API Endpoints

#### Get Conversations
```
GET /api/conversations?userId={userId}
```
Returns list of friends with last message and unread count.

#### Get Messages
```
GET /api/messages?userId={userId}&friendId={friendId}&limit=50&offset=0
```

#### Send Message
```
POST /api/messages
Content-Type: application/json

Body:
{
  "senderId": "uuid",
  "receiverId": "uuid",
  "message": "Hello!"
}
```

#### Mark Messages as Read
```
PATCH /api/messages?userId={userId}&friendId={friendId}
```

### Usage

Navigate to `/chat` in the web app to access the messaging interface.

## ⏳ Loading States

### Overview
Added professional loading indicators throughout the application for better UX.

### Loader Component

A reusable `Loader` component has been added with the following features:
- Three sizes: small, medium, large
- Optional full-screen overlay
- Optional loading message
- Animated spinner with brand colors

### Usage

```typescript
import { Loader } from '@/components/Loader';

// Simple loader
<Loader />

// With size and message
<Loader size="large" message="Loading profile..." />

// Full screen overlay
<Loader fullScreen message="Please wait..." />
```

### Applied To
- Profile page load
- Users/Discover page load
- Chat page load
- Any other data fetching operations

## 📱 Responsive Profile Edit

### Overview
The profile edit form now uses a two-column layout on laptop and larger screens for better space utilization.

### Features
- **Mobile**: Single column layout
- **Tablet (769px+)**: Single column layout
- **Laptop (1024px+)**: Two column grid layout
- **Desktop (1440px+)**: Two column with larger spacing

### CSS Implementation

The layout automatically adjusts using CSS Grid:

```css
@media (min-width: 1024px) {
  .editContainer form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }
}
```

## 🎨 Header Overlap Fix

### Overview
Ensured all pages have proper top padding to prevent content from overlapping with the fixed header.

### Implementation
- Header is fixed with `z-index: 1000`
- All main content areas have `padding-top` values:
  - Mobile: 70-90px
  - Tablet: 100px
  - Desktop: 120px
- Cards and content properly spaced

## 🔧 Development Setup

### Install Dependencies

```bash
# Root
npm install

# Backend (for Cloudinary)
cd apps/backend
npm install cloudinary multer
npm install -D @types/multer
```

### Environment Variables

Update your `.env` files:

**Backend (`apps/backend/.env`):**
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Run Migrations

```bash
cd apps/backend
npm run migrate:up
```

This will create:
1. `profile_images` table
2. `messages` table

### Start Development Server

```bash
# From root
npm run dev
```

## 📝 Migration Files

### Profile Images Migration
File: `apps/backend/migrations/1763508399593_add-profile-images-table.js`
- Creates `profile_images` table
- Adds indexes for efficient queries

### Messages Migration
File: `apps/backend/migrations/1763508426680_create-messages-table.js`
- Creates `messages` table
- Adds indexes for conversations
- Prevents self-messaging with constraint

## 🧪 Testing

### Manual Testing Checklist

**Image Upload:**
- [ ] Upload a profile image
- [ ] Set image as primary
- [ ] Upload multiple images
- [ ] Delete an image
- [ ] View images in profile

**Chat System:**
- [ ] View conversations list
- [ ] Send a message to a friend
- [ ] Receive a message
- [ ] See unread count
- [ ] Messages marked as read
- [ ] Messages update in real-time

**Loading States:**
- [ ] Profile page shows loader
- [ ] Users page shows loader
- [ ] Chat page shows loader

**Responsive Design:**
- [ ] Test on mobile (< 768px)
- [ ] Test on tablet (769-1023px)
- [ ] Test on laptop (1024px+)
- [ ] Profile edit form shows two columns on laptop+

## 🚀 Deployment Notes

### Environment Variables
Ensure all Cloudinary credentials are set in production environment.

### Database Migrations
Run migrations on production database:
```bash
npm run migrate:up
```

### Build
The backend builds successfully. The web app may show errors during static generation because pages require authentication, but they work correctly in runtime.

## 📚 Additional Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/sql-createtrigger.html)

## 🐛 Known Issues

1. Web app static build shows errors for authenticated pages - this is expected as these pages require runtime authentication
2. Chat polling every 3 seconds - consider WebSockets for production for true real-time messaging

## 🔮 Future Enhancements

- [ ] WebSocket implementation for real-time chat
- [ ] Image upload progress indicator
- [ ] Image cropping/editing before upload
- [ ] Video message support
- [ ] Group chat functionality
- [ ] Push notifications for new messages
