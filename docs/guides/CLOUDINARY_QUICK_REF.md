# 🔧 Cloudinary Quick Reference

## 🚀 Ready to Use Components

### ImageUpload Component

```tsx
import { ImageUpload } from '@/components/ImageUpload';

<ImageUpload
  currentImage={profileData.avatar}
  folder="bicicita/profiles"
  onImageChange={(imageUrl) => setProfileData({ ...profileData, avatar: imageUrl })}
  size="medium" // "small" | "medium" | "large"
  className="custom-class" // optional
/>;
```

### API Endpoints

```javascript
// Upload Image
POST /api/upload
FormData: { file: File, folder?: string }
Response: { success: boolean, data: { url: string, publicId: string } }

// Delete Image
DELETE /api/upload?publicId=<publicId>
Response: { success: boolean }

// Health Check
GET /api/health
Response: { success: boolean, message: string, timestamp: string }
```

## ⚡ Quick Test Commands

```bash
# Check environment
node check-cloudinary.js

# Test upload/delete
node test-upload-api.js

# Start backend
npm run dev  # in apps/backend/

# Start frontend
npm run dev  # in apps/web/
```

## 🎯 Endpoints Available

- **Frontend**: http://localhost:3002
- **Backend**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health
- **Upload API**: http://localhost:3001/api/upload

## 🔐 Environment Variables

```env
# Required in apps/backend/.env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## ⚙️ Next.js Configuration

Add to `apps/web/next.config.js`:

```javascript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'res.cloudinary.com',
      port: '',
      pathname: '/**',
    },
  ],
},
```

## 📁 File Organization

```
bicicita/
├── profiles/     # User profile images
├── uploads/      # General uploads
└── test/         # Test images (auto-cleanup)
```

## 🎨 Image Transformations

- **Max Size**: 1000x1000px
- **Quality**: Auto-optimized
- **Format**: Auto (WebP/AVIF when supported)
- **Crop**: Smart crop with face detection for avatars

## ⚠️ Troubleshooting

- **"Upload failed"**: Check Cloudinary credentials
- **"File too large"**: Max 10MB limit
- **"Invalid file type"**: Only images allowed
- **Connection error**: Ensure backend running on port 3001
- **"hostname not configured"**: Add Cloudinary domain to next.config.js images

## 📚 Documentation

- `CLOUDINARY_SETUP.md` - Initial setup
- `CLOUDINARY_IMPLEMENTATION_COMPLETE.md` - Technical details
- `CLOUDINARY_SUCCESS_REPORT.md` - Test results
