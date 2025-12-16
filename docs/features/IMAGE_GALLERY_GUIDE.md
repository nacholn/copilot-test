# Profile Image Gallery Guide

## Overview

The profile now supports multiple images with a dedicated gallery view. Users can:

- Upload multiple images to their profile
- Designate one image as the primary (avatar)
- View all images in an organized gallery
- Manage images (delete, set as primary)
- View full-size image previews

## Features

### 1. Primary Image (Avatar)

- **What it is**: The main profile picture displayed throughout the app
- **Display**: Shows prominently at the top of the gallery
- **Badge**: Labeled with "Primary" badge
- **Usage**: This image appears in:
  - Profile page header
  - User cards
  - Chat conversations
  - Friend lists

### 2. Secondary Images

- **What they are**: Additional profile photos
- **Display**: Shown in a responsive grid below the primary image
- **Limit**: Unlimited secondary images
- **Usage**: Visible only in the full profile view

## How to Use

### Accessing the Gallery

1. **Navigate to Profile**:
   - Click "Profile" in the header navigation
   - Or go to `/profile` URL

2. **Open Image Gallery**:
   - Look for the "+ Profile Images" button
   - Click to expand the gallery section
   - Click again to collapse

### Uploading Images

#### Upload Primary Image (First Image):

```
1. In the expanded gallery, look for "Primary Image" section
2. If no primary image exists, you'll see an upload zone
3. Click "Add Image" or drag and drop an image file
4. Supported formats: PNG, JPG, GIF (up to 10MB)
5. Image uploads to Cloudinary with automatic optimization
```

#### Upload Secondary Images:

```
1. Scroll to "Additional Images" section
2. Click the "+ Add Image" button in the grid
3. Select or drag an image file
4. Image is added to the secondary images grid
```

### Managing Images

#### Set Image as Primary:

```
1. Hover over any secondary image
2. Click the star (⭐) button
3. Image becomes the new primary/avatar
4. Previous primary image moves to secondary images
```

#### Delete Image:

```
1. Hover over any image (primary or secondary)
2. Click the trash (🗑️) button
3. Confirm deletion in the popup
4. Image is removed from Cloudinary and database
```

#### View Full Size:

```
1. Click on any secondary image
2. Full-size modal opens
3. Click X button or outside modal to close
```

## Gallery Layout

### Desktop (1024px+):

```
Primary Image:       400x400px center-aligned
Secondary Grid:      4 columns, auto-fit (180px min)
```

### Tablet (769-1023px):

```
Primary Image:       400x400px center-aligned
Secondary Grid:      3-4 columns, auto-fit (140px min)
```

### Mobile (<768px):

```
Primary Image:       Full width
Secondary Grid:      2-3 columns, auto-fit (120px min)
```

## Technical Details

### API Endpoints

**Get all images**:

```http
GET /api/profile/images?userId={userId}
Response: Array of ProfileImage objects
```

**Upload image**:

```http
POST /api/profile/images
Content-Type: multipart/form-data
Body: { userId, isPrimary, file }
Response: Uploaded ProfileImage object
```

**Delete image**:

```http
DELETE /api/profile/images?imageId={id}&userId={userId}
Response: Success confirmation
```

**Set as primary**:

```http
PATCH /api/profile/images?imageId={id}&userId={userId}
Body: { isPrimary: true }
Response: Updated ProfileImage object
```

### Database Schema

Images are stored in the `profile_images` table:

```sql
CREATE TABLE profile_images (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(user_id),
  image_url TEXT NOT NULL,
  cloudinary_public_id TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE
);
```

### Component Structure

```
ProfileImageGallery (Main Component)
├── Primary Section
│   ├── Image Display (if exists)
│   │   ├── Image Component
│   │   ├── Primary Badge
│   │   └── Delete Button (editable mode)
│   └── Upload Zone (if no primary)
│
├── Secondary Section
│   ├── Images Grid
│   │   └── Image Cards (multiple)
│   │       ├── Image Component
│   │       ├── Set Primary Button (⭐)
│   │       └── Delete Button (🗑️)
│   └── Add Image Button
│
└── Image Modal (when image clicked)
    ├── Full-size Image
    └── Close Button
```

## Multilingual Support

The gallery interface supports 3 languages:

- **English (EN)**: Default
- **Spanish (ES)**: Translated UI
- **French (FR)**: Translated UI

### Translation Keys

Profile-related translations:

```json
{
  "profile.primaryImage": "Primary Image",
  "profile.secondaryImages": "Additional Images",
  "profile.addImage": "Add Image",
  "profile.images": "Profile Images",
  "profile.noSecondaryImages": "No additional images yet"
}
```

Common translations:

```json
{
  "common.delete": "Delete",
  "common.primary": "Primary",
  "common.loading": "Loading...",
  "imageUpload.uploading": "Uploading...",
  "imageUpload.uploadFailed": "Upload failed"
}
```

## Best Practices

### Image Optimization

- Cloudinary automatically optimizes images
- Original images transformed to:
  - Max dimensions: 1000x1000px
  - Quality: auto:good
  - Format: auto (WebP when supported)

### User Experience

1. **Always have a primary image**: Helps with visual identification
2. **Add 2-5 secondary images**: Shows personality without overwhelming
3. **High-quality photos**: Better first impressions
4. **Relevant images**: Cycling-related photos work best

### Performance

- Images lazy-load in the gallery
- Thumbnails generated automatically
- CDN delivery via Cloudinary
- Responsive image sizing

## Troubleshooting

### Issue: Upload fails

**Solutions**:

- Check file size (must be < 10MB)
- Verify file format (PNG, JPG, GIF only)
- Ensure Cloudinary credentials are configured
- Check internet connection

### Issue: Image doesn't appear

**Solutions**:

- Refresh the page
- Check browser console for errors
- Verify image URL is accessible
- Ensure database migration ran successfully

### Issue: Can't delete image

**Solutions**:

- Ensure you're the profile owner
- Check if you're in editable mode
- Verify userId matches logged-in user

### Issue: Translations not showing

**Solutions**:

- Check language selector in header
- Verify translation files exist
- Clear browser localStorage
- Refresh the page

## Development

### Adding New Translations

1. Edit translation files:

```
apps/web/src/messages/en.json
apps/web/src/messages/es.json
apps/web/src/messages/fr.json
```

2. Add new keys:

```json
{
  "profile": {
    "newKey": "New English Text"
  }
}
```

3. Use in components:

```typescript
const { t } = useTranslations();
<p>{t('profile.newKey')}</p>
```

### Customizing Gallery

Edit styles in:

```
apps/web/src/components/profile-image-gallery.module.css
```

Change grid layout:

```css
.secondaryGrid {
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}
```

## Summary

The profile image gallery provides:
✅ Primary + unlimited secondary images
✅ Easy upload and management
✅ Cloudinary integration with optimization
✅ Responsive design for all devices
✅ Full-size image preview
✅ Multilingual interface (EN/ES/FR)
✅ Secure API with user validation

For more details, see:

- `NEW_FEATURES.md` - Complete API documentation
- `IMPLEMENTATION_SUMMARY.md` - Technical details
- `QUICK_START.md` - Setup guide
