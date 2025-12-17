# Cloudinary Setup Guide

This guide will help you set up Cloudinary image uploads for the Bicicita.

## 🚀 Quick Setup

### 1. Create a Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com) and sign up for a free account
2. Once logged in, go to the [Dashboard](https://cloudinary.com/console)
3. You'll see your account details including:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 2. Configure Environment Variables

Add these variables to `apps/backend/.env`:

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name-here
CLOUDINARY_API_KEY=your-api-key-here
CLOUDINARY_API_SECRET=your-api-secret-here
```

⚠️ **Important**: Replace the placeholder values with your actual Cloudinary credentials!

### 3. Test the Configuration

Run the test script to verify everything works:

```bash
cd apps/backend
node test-cloudinary.js
```

If successful, you'll see:

```
🎉 Cloudinary integration is working perfectly!
```

## 🔧 Features Included

### Image Upload Component

- **Drag & Drop**: Users can drag images directly into the upload area
- **Click to Upload**: Traditional file picker interface
- **Image Preview**: Live preview of uploaded images
- **File Validation**: Automatic validation of file types and sizes
- **Error Handling**: User-friendly error messages

### Backend API

- **Upload Endpoint**: `POST /api/upload` with automatic optimization
- **Delete Endpoint**: `DELETE /api/upload?publicId=xxx` for cleanup
- **Image Transformations**: Automatic resizing and optimization
- **Security**: File type and size validation

### Image Optimizations

- **Auto-resize**: Maximum 1000x1000 pixels
- **Quality optimization**: Automatic quality adjustment
- **Format optimization**: Modern formats (WebP, AVIF) when supported
- **Responsive delivery**: Different sizes based on device

## 📱 Usage in the App

### Profile Pictures

- Users can upload profile images in the registration and profile edit forms
- Images are automatically optimized and stored in the `cyclists/profiles` folder
- Old images are automatically cleaned up when users upload new ones

### File Requirements

- **Supported formats**: PNG, JPG, GIF, WebP
- **Maximum size**: 10MB
- **Recommended size**: At least 400x400 pixels for best quality

## 🔒 Security Features

- **File type validation**: Only image files are accepted
- **Size limits**: 10MB maximum to prevent abuse
- **Secure URLs**: All images served over HTTPS
- **Access control**: Upload endpoint validates file types server-side

## 📊 Free Tier Limits

Cloudinary's free tier includes:

- **25 GB storage**
- **25 GB monthly bandwidth**
- **25,000 transformations per month**

This is more than enough for most applications. You can monitor usage in your Cloudinary dashboard.

## 🛠️ Troubleshooting

### "Invalid API key" Error

- Check that `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` are correct
- Make sure there are no extra spaces in the environment variables
- Restart the backend server after changing environment variables

### "Cloud not found" Error

- Check that `CLOUDINARY_CLOUD_NAME` is correct
- Cloud name should not include the full URL, just the name

### Upload Fails Silently

- Check browser network tab for API call errors
- Check backend logs for error details
- Run the test script to verify Cloudinary configuration

### Images Not Loading

- Check that the URLs in the database are correct
- Verify the images exist in your Cloudinary media library
- Check browser console for CORS or loading errors

## 🔗 Useful Links

- [Cloudinary Console](https://cloudinary.com/console)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Image Transformation Reference](https://cloudinary.com/documentation/image_transformation_reference)
- [Upload API Reference](https://cloudinary.com/documentation/image_upload_api_reference)

## 📝 Next Steps

Once Cloudinary is set up, you can:

1. **Test image uploads** in the profile form
2. **Monitor usage** in the Cloudinary dashboard
3. **Customize transformations** in `apps/backend/src/lib/cloudinary.ts`
4. **Add more image features** like multiple image uploads for posts

## 🎯 Integration Status

✅ **Backend API** - Upload and delete endpoints ready  
✅ **Frontend Component** - Drag & drop upload component ready  
✅ **Profile Integration** - Profile form uses ImageUpload component  
✅ **Error Handling** - Comprehensive error handling and user feedback  
✅ **Testing** - Test script for verifying configuration  
⏳ **Configuration** - Add your Cloudinary credentials to complete setup

Once you add your Cloudinary credentials, image uploads will work seamlessly throughout the application!
