# Database Setup for Cycling Network Platform

This directory contains database migrations and setup instructions for the PostgreSQL database running on Supabase.

## Quick Setup

1. **Go to your Supabase Dashboard**
   - Visit https://app.supabase.com
   - Select your project
   - Navigate to SQL Editor

2. **Run the Migration**
   - Open `migrations/001_create_cyclist_profiles.sql`
   - Copy the entire content
   - Paste it into the SQL Editor
   - Click "Run" to execute

3. **Verify Setup**
   - Go to Table Editor
   - You should see `cyclist_profiles` table
   - Check that RLS (Row Level Security) is enabled

## Database Schema

### cyclist_profiles Table

Stores detailed information about each cyclist.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to auth.users (unique) |
| `email` | TEXT | User's email |
| `sex` | TEXT | Gender (male, female, other, prefer_not_to_say) |
| `level` | TEXT | Cycling level (beginner, intermediate, advanced, professional) |
| `birth_date` | DATE | Date of birth |
| `photo_url` | TEXT | Profile photo URL (auto-generated if not provided) |
| `city` | TEXT | City/location |
| `latitude` | DECIMAL | GPS latitude |
| `longitude` | DECIMAL | GPS longitude |
| `description` | TEXT | Optional bio/description |
| `bike_type` | TEXT | Type of bicycle (road, mountain, hybrid, gravel, electric, other) |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

## Features

### 1. Auto-create Profile on Signup
When a user signs up via Supabase Auth, a cyclist profile is automatically created with:
- User ID and email
- Auto-generated avatar using UI Avatars (based on initials)
- Default timestamps

### 2. Avatar Generation
The migration includes a function `generate_avatar_url()` that creates avatars using [UI Avatars](https://ui-avatars.com/):
- Extracts initials from email
- Generates a unique color based on email hash
- Returns a URL to a generated avatar image

Example: `user@example.com` → Avatar with "US" initials

### 3. Row Level Security (RLS)
Security policies are in place:
- **SELECT**: Anyone can view all cyclist profiles
- **INSERT**: Users can only create their own profile
- **UPDATE**: Users can only update their own profile
- **DELETE**: Users can only delete their own profile

### 4. Indexes
For optimal performance:
- `user_id` index for fast profile lookups
- `email` index for search functionality
- Location index (latitude, longitude) for proximity searches

### 5. Automatic Timestamps
The `updated_at` column is automatically updated whenever a profile is modified.

## API Endpoints

Once the database is set up, these backend endpoints will work:

### Get Current User's Profile
```bash
GET /api/profiles/me
Authorization: Bearer <token>
```

### Update Current User's Profile
```bash
PUT /api/profiles/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "sex": "male",
  "level": "intermediate",
  "city": "Barcelona",
  "bikeType": "road",
  "description": "Love cycling in the mountains!"
}
```

### Get All Profiles (Public)
```bash
GET /api/profiles?limit=20&city=Barcelona
```

### Get Specific Profile (Public)
```bash
GET /api/profiles/[user-id]
```

## Testing

After running the migration:

1. **Sign up a test user** in your app
2. **Check the database** - A profile should be auto-created
3. **Test the API endpoints** using curl or Postman
4. **Verify RLS** - Try accessing another user's profile

## Troubleshooting

### Profile not created on signup
- Check if the trigger `on_auth_user_created` exists
- Verify the trigger function `handle_new_user()` is working
- Check Supabase logs for errors

### Permission denied errors
- Ensure RLS policies are created correctly
- Verify you're passing the auth token in requests
- Check that the token is valid

### Can't update profile
- Ensure you're authenticated
- Verify the user_id matches the authenticated user
- Check the UPDATE policy is in place

## Security Notes

⚠️ **Important Security Considerations:**

1. The `email` field is public - users should be aware
2. Location data (latitude, longitude) is public
3. All profile data is viewable by anyone
4. Only the profile owner can modify their data
5. Never store sensitive data in this table

## Future Enhancements

Potential additions to consider:

- [ ] Privacy settings (hide location, email, etc.)
- [ ] Profile completion percentage
- [ ] Social connections (followers/following)
- [ ] Activity statistics
- [ ] Profile verification badges
- [ ] Photo upload to Supabase Storage
- [ ] Search by proximity (find cyclists nearby)
- [ ] Profile views counter

## Need Help?

- Check Supabase documentation: https://supabase.com/docs
- Review PostgreSQL docs: https://www.postgresql.org/docs/
- See the main README.md for general setup instructions
