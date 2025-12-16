# Quick Start Guide

Get up and running with the new features in 5 minutes.

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Dependencies (1 min)
```bash
npm install
```

### Step 2: Configure Cloudinary (2 min)

1. Sign up at [cloudinary.com](https://cloudinary.com) (free tier available)
2. Get your credentials from the Dashboard
3. Create `apps/backend/.env`:

```env
# Copy from .env.example and fill in:
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Also include existing config:
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cyclists_db
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Run Migrations (1 min)
```bash
cd apps/backend
npm run migrate:up
```

This creates two new tables:
- `profile_images` - for storing multiple profile images
- `messages` - for friend-to-friend chat

### Step 4: Start Development (1 min)
```bash
# From root directory
npm run dev
```

Visit:
- **Web App**: http://localhost:3000
- **Backend API**: http://localhost:3001

## 🎯 Try the New Features

### 1. Upload Profile Images
1. Login to the app
2. Go to Profile → Edit Profile
3. Click image upload (when implemented in UI)
4. Or use the API directly:

```bash
curl -X POST http://localhost:3001/api/profile/images \
  -F "userId=your-user-id" \
  -F "isPrimary=true" \
  -F "file=@/path/to/image.jpg"
```

### 2. Send Messages to Friends
1. Add a friend from the Discover page
2. Click **Chat** in the header
3. Select a friend from the conversations list
4. Type a message and press send
5. Messages auto-refresh every 3 seconds

### 3. See Loading Indicators
- Navigate to Profile page → See loader
- Navigate to Discover page → See loader while fetching users
- Navigate to Chat page → See loader while fetching conversations

### 4. Test Responsive Profile Edit
1. Go to Profile → Edit Profile
2. Resize browser window:
   - **< 1024px**: Single column layout
   - **≥ 1024px**: Two column layout

## 📱 Key Pages

| Page | URL | Features |
|------|-----|----------|
| Chat | `/chat` | View conversations, send/receive messages |
| Profile | `/profile` | View/edit profile, upload images |
| Discover | `/users` | Find other cyclists, add friends |
| Friends | `/friends` | View your friends list |

## 🔑 API Endpoints Quick Reference

### Image Upload
```http
POST /api/profile/images
Content-Type: multipart/form-data

userId, isPrimary, file
```

### Get User Images
```http
GET /api/profile/images?userId={userId}
```

### Send Message
```http
POST /api/messages
Content-Type: application/json

{
  "senderId": "uuid",
  "receiverId": "uuid",
  "message": "Hello!"
}
```

### Get Conversations
```http
GET /api/conversations?userId={userId}
```

## 🐛 Troubleshooting

### "Cannot find module '@cyclists/config'"
```bash
cd packages/config
npm run build
```

### "Supabase URL and Key are required"
Make sure `.env` files are created in both `apps/backend` and `apps/web` with Supabase credentials.

### "Table does not exist"
Run migrations:
```bash
cd apps/backend
npm run migrate:up
```

### Images not uploading
1. Check Cloudinary credentials in `apps/backend/.env`
2. Verify credentials are correct in Cloudinary dashboard
3. Check backend logs for errors

### Chat not working
1. Ensure you have added friends
2. Check browser console for API errors
3. Verify backend is running on port 3001
4. Check database migrations ran successfully

## 📚 More Information

- **Detailed Features**: See [New Features Guide](../features/NEW_FEATURES.md)
- **Implementation Details**: See [Implementation Complete](../reports/IMPLEMENTATION_COMPLETE.md)
- **Setup Guide**: See [Setup Guide](./SETUP.md)
- **Architecture**: See [Architecture Overview](../architecture/ARCHITECTURE.md)

## 🎉 That's It!

You're now ready to:
- ✅ Upload profile images to Cloudinary
- ✅ Store multiple images per profile
- ✅ Chat with friends in real-time
- ✅ See loading indicators
- ✅ Use responsive profile editing

## 🆘 Need Help?

Check the documentation files or open an issue on GitHub.

---

**Next Steps:**
1. Try uploading an image via the API
2. Add a friend and send them a message
3. Test the responsive design on different screen sizes
4. Read the full documentation for advanced features
