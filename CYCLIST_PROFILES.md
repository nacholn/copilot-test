# Cyclist Profiles Feature

Complete guide for the cyclist profile management system in the Cycling Network Platform.

## Overview

The cyclist profile system allows users to create and manage detailed profiles including personal information, cycling preferences, and location data. Profiles are automatically created when users sign up and can be edited through both web and mobile interfaces.

## Architecture

### Database (PostgreSQL on Supabase)
- **Table**: `cyclist_profiles`
- **Auto-creation**: Triggered when user signs up via Supabase Auth
- **Security**: Row Level Security (RLS) policies
- **Avatar**: Auto-generated using UI Avatars API

### Backend API (Next.js)
- **GET** `/api/profiles/me` - Get current user's profile
- **PUT** `/api/profiles/me` - Update current user's profile
- **GET** `/api/profiles` - List all profiles (public, with filters)
- **GET** `/api/profiles/[id]` - Get specific profile (public)

### Frontend
- **Web**: `/profile` page with form component
- **Mobile**: `/profile` screen with native form

## Profile Fields

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `email` | string | User's email (from auth) | ✓ |
| `sex` | enum | male, female, other, prefer_not_to_say | ✗ |
| `level` | enum | beginner, intermediate, advanced, professional | ✗ |
| `birthDate` | date | Date of birth (ISO format) | ✗ |
| `photoUrl` | string | Profile photo URL (auto-generated) | ✗ |
| `city` | string | City/location name | ✗ |
| `latitude` | number | GPS latitude | ✗ |
| `longitude` | number | GPS longitude | ✗ |
| `description` | string | Bio/about me text | ✗ |
| `bikeType` | enum | road, mountain, hybrid, gravel, electric, other | ✗ |

## Setup Instructions

### 1. Database Setup

Run the migration in your Supabase SQL Editor:

```sql
-- Copy contents from: apps/backend/database/migrations/001_create_cyclist_profiles.sql
-- Paste into: https://app.supabase.com → SQL Editor → Run
```

This creates:
- `cyclist_profiles` table with all fields
- RLS policies for security
- Indexes for performance
- Auto-creation trigger on user signup
- Avatar generation function
- Automatic timestamp updates

### 2. Verify Database

Check in Supabase Dashboard:
1. Go to Table Editor
2. You should see `cyclist_profiles` table
3. RLS should be enabled (shield icon)
4. Sign up a test user to verify auto-creation

### 3. Test API Endpoints

```bash
# Start backend
cd apps/backend && npm run dev

# Get your auth token (from browser DevTools after login)
TOKEN="your_supabase_auth_token"

# Get your profile
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/profiles/me

# Update your profile
curl -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"level":"intermediate","city":"Barcelona","bikeType":"road"}' \
  http://localhost:3001/api/profiles/me

# List all profiles (public)
curl http://localhost:3001/api/profiles

# Filter by city
curl http://localhost:3001/api/profiles?city=Barcelona

# Get specific profile
curl http://localhost:3001/api/profiles/USER_ID_HERE
```

### 4. Test Web UI

```bash
# Start web app
cd apps/web && npm run dev

# Visit: http://localhost:3000
# 1. Sign in with your account
# 2. Click "My Profile"
# 3. Fill out your profile information
# 4. Click "Save Profile"
```

### 5. Test Mobile UI

```bash
# Start mobile app
cd apps/mobile && npm start

# In Expo Go or simulator:
# 1. Sign in with your account
# 2. Tap "My Profile"
# 3. Fill out your profile information
# 4. Tap "Save Profile"
```

## Usage Guide

### For Users

**Web App:**
1. Sign in at the home page
2. Click "My Profile" button
3. See your current profile with avatar
4. Fill in/update any fields
5. Click "Save Profile"
6. See success message

**Mobile App:**
1. Sign in at the home screen
2. Tap "My Profile" button
3. See your profile header
4. Update fields using pickers and text inputs
5. Tap "Save Profile"
6. See success alert

### For Developers

#### Backend API Agent Usage

**Add new profile field:**

1. Update database migration:
```sql
ALTER TABLE cyclist_profiles ADD COLUMN new_field TEXT;
```

2. Update TypeScript types:
```typescript
// packages/config/src/types.ts
export interface CyclistProfile {
  // ... existing fields
  newField?: string;
}
```

3. Update API endpoints:
```typescript
// apps/backend/src/pages/api/profiles/me.ts
// Add to camelCase conversion:
newField: profile.new_field
```

#### Web PWA Agent Usage

**Add field to web form:**

```typescript
// apps/web/src/components/ProfileForm.tsx
<div style={fieldStyle}>
  <label htmlFor="newField" style={labelStyle}>
    New Field Label
  </label>
  <input
    type="text"
    id="newField"
    name="newField"
    value={formData.newField || ''}
    onChange={handleChange}
    style={inputStyle}
  />
</div>
```

#### Mobile App Agent Usage

**Add field to mobile form:**

```typescript
// apps/mobile/components/ProfileForm.tsx
<View style={styles.field}>
  <Text style={styles.label}>New Field Label</Text>
  <TextInput
    value={formData.newField || ''}
    onChangeText={(value) => updateField('newField', value)}
    style={styles.input}
  />
</View>
```

#### Config Package Agent Usage

**Add validation or utility:**

```typescript
// packages/config/src/types.ts
export function isProfileComplete(profile: CyclistProfile): boolean {
  return !!(
    profile.level &&
    profile.city &&
    profile.bikeType
  );
}
```

## Features

### Auto-Generated Avatars

When users sign up, an avatar is automatically generated using their email:
- Extracts initials from email (first 2 characters before @)
- Generates unique color based on email hash
- Creates URL: `https://ui-avatars.com/api/?name=AB&background=abcdef&color=fff`

Example: `john.doe@example.com` → Avatar with "JO" initials

### Row Level Security

Profiles are protected with RLS policies:
- ✅ **Anyone** can **view** all profiles (discovery)
- ✅ **Users** can only **create** their own profile
- ✅ **Users** can only **update** their own profile
- ✅ **Users** can only **delete** their own profile

### Profile Discovery

Public API endpoints allow:
- Browse all cyclist profiles
- Filter by city
- Filter by level
- Search cyclists near you (future: proximity search)

### Privacy Considerations

⚠️ **Important:** All profile data is currently public!
- Email addresses are visible
- Location data (city, lat/long) is visible
- Consider adding privacy settings in the future

## API Reference

### Get Current User Profile

```http
GET /api/profiles/me
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "email": "user@example.com",
    "sex": "male",
    "level": "intermediate",
    "birthDate": "1990-01-15",
    "photoUrl": "https://ui-avatars.com/api/...",
    "city": "Barcelona",
    "latitude": null,
    "longitude": null,
    "description": "Love mountain biking!",
    "bikeType": "mountain",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-02T00:00:00Z"
  }
}
```

**Response (404):** Profile not found (user needs to sign up)

### Update Current User Profile

```http
PUT /api/profiles/me
Authorization: Bearer {token}
Content-Type: application/json

{
  "level": "advanced",
  "city": "Madrid",
  "bikeType": "road",
  "description": "Competitive cyclist"
}
```

**Response (200):**
```json
{
  "data": { /* updated profile */ },
  "message": "Profile updated successfully"
}
```

### List All Profiles

```http
GET /api/profiles?limit=20&offset=0&city=Barcelona&level=intermediate
```

**Query Parameters:**
- `limit` (default: 50, max: 100)
- `offset` (default: 0)
- `city` (filter by city, case-insensitive)
- `level` (filter by exact level)

**Response (200):**
```json
{
  "data": [
    { /* profile 1 */ },
    { /* profile 2 */ }
  ],
  "message": "Found 2 profiles"
}
```

### Get Specific Profile

```http
GET /api/profiles/{userId}
```

**Response (200):**
```json
{
  "data": { /* profile */ }
}
```

**Response (404):** Profile not found

## Troubleshooting

### Profile not created on signup

**Check:**
1. Is the trigger `on_auth_user_created` present in the database?
2. Does the function `handle_new_user()` exist?
3. Check Supabase logs for errors

**Fix:**
Re-run the migration SQL file.

### Can't update profile

**Check:**
1. Are you authenticated? (Check token)
2. Does the profile exist? (Sign up first)
3. Is RLS enabled with correct UPDATE policy?

**Debug:**
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'cyclist_profiles';

-- View policies
SELECT * FROM pg_policies WHERE tablename = 'cyclist_profiles';
```

### API returns 401 Unauthorized

**Check:**
1. Is the token valid? (Not expired)
2. Is the token in the Authorization header?
3. Format: `Bearer {token}` (with space)

**Get fresh token:**
```javascript
const { data } = await supabase.auth.getSession();
console.log(data.session.access_token);
```

### Avatar not showing

**Check:**
1. Is `photo_url` field populated?
2. Is UI Avatars API accessible?
3. Check network/CORS issues

**Fallback:**
The UI uses a fallback avatar if `photoUrl` is null.

## Future Enhancements

Potential improvements:

- [ ] **Privacy Controls**: Hide email, location, etc.
- [ ] **Photo Upload**: Allow users to upload custom photos (Supabase Storage)
- [ ] **Location Picker**: Map interface to set latitude/longitude
- [ ] **Profile Completion**: Show % complete, encourage users to fill in details
- [ ] **Social Features**: Follow other cyclists, activity feed
- [ ] **Search & Discovery**: Find cyclists nearby, advanced filters
- [ ] **Profile Views**: Track who viewed your profile
- [ ] **Verification Badges**: Verified users, active cyclists
- [ ] **Stats Integration**: Show cycling statistics on profile
- [ ] **Export Profile**: Download profile data (GDPR compliance)

## Related Documentation

- [Database Setup README](apps/backend/database/README.md) - Detailed database guide
- [Backend API Agent](.github/agents/backend-api-agent.md) - Backend development patterns
- [Web PWA Agent](.github/agents/web-pwa-agent.md) - Web UI development patterns
- [Mobile App Agent](.github/agents/mobile-app-agent.md) - Mobile development patterns
- [Config Package Agent](.github/agents/config-package-agent.md) - Types and configuration

## Support

For issues or questions:
1. Check this guide and related documentation
2. Review Supabase logs in dashboard
3. Check browser DevTools console for errors
4. Test API endpoints with curl
5. Verify database RLS policies

---

**Built by the Cycling Network Platform team using specialized GitHub Copilot agents** 🚴‍♂️
