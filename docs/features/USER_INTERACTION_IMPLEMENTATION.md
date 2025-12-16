# User Interaction Score & Enhanced Discovery Implementation

## Overview

This document describes the implementation of a user interaction scoring system and enhanced discovery features for the Cyclists Social Network application. The system tracks user activity and uses it to rank users in the discovery interface, showing more active users first.

## Features Implemented

### 1. User Interaction Tracking

The system tracks the following user activities:

- **Last Login** (`last_login_at`): Updated each time a user successfully logs in
- **Last Message Sent** (`last_message_sent_at`): Updated when a user sends a chat message
- **Last Post Created** (`last_post_created_at`): Updated when a user creates a new post
- **Last Friend Accepted** (`last_friend_accepted_at`): Updated when a user accepts a friend request

### 2. Interaction Score Calculation

A calculated score (0-100) based on recency of activities with exponential decay:

- **Login Activity** (40 points max): `40 × e^(-days_since_login / 30)`
- **Messaging Activity** (25 points max): `25 × e^(-days_since_message / 7)`
- **Post Creation** (25 points max): `25 × e^(-days_since_post / 14)`
- **Friend Acceptance** (10 points max): `10 × e^(-days_since_friend / 30)`

The score automatically decreases over time using exponential decay, with different decay rates for different activities:
- Login: 30-day half-life
- Messages: 7-day half-life (most weight on recent activity)
- Posts: 14-day half-life
- Friend acceptance: 30-day half-life

### 3. Enhanced User Discovery

#### Name Search
- New dedicated search field for searching users by name
- More precise than the general search field

#### Distance Filter
- Horizontal slider from 1km to 500km or "All distances"
- Only appears if the current user has location data (latitude/longitude)
- Uses Haversine formula to calculate distances between users
- Filters users based on their profile location

#### Automatic Sorting
- Users are now automatically sorted by interaction score (highest first)
- More active users appear at the top of the discovery list
- Encourages engagement with active community members

## Database Schema Changes

### Migration: `1765500119714_add-user-interaction-fields.mjs`

Added to `profiles` table:
```sql
last_login_at              TIMESTAMP WITH TIME ZONE
last_message_sent_at       TIMESTAMP WITH TIME ZONE
last_post_created_at       TIMESTAMP WITH TIME ZONE
last_friend_accepted_at    TIMESTAMP WITH TIME ZONE
interaction_score          NUMERIC(10, 2) DEFAULT 0 NOT NULL
```

Indexes created:
- `idx_profiles_interaction_score` on `interaction_score`
- `idx_profiles_last_login_at` on `last_login_at`

Database functions:
- `calculate_interaction_score()`: Calculates score based on activity timestamps
- `update_interaction_score()`: Trigger function to auto-update score on profile changes

## API Changes

### `/api/users` Endpoint (GET)

New query parameters:
- `name`: Search by user name specifically
- `distance`: Maximum distance in kilometers (requires userLatitude and userLongitude)
- `userLatitude`: Current user's latitude (for distance calculation)
- `userLongitude`: Current user's longitude (for distance calculation)

Results are now sorted by `interaction_score DESC, created_at DESC`

### Updated Endpoints

The following endpoints now update interaction timestamps:

1. **`/api/auth/login` (POST)**
   - Updates `last_login_at` after successful login

2. **`/api/messages` (POST)**
   - Updates `last_message_sent_at` when sending a message

3. **`/api/posts` (POST)**
   - Updates `last_post_created_at` when creating a post

4. **`/api/friend-requests` (PATCH)**
   - Updates `last_friend_accepted_at` when accepting a friend request

## TypeScript Types

### Updated `Profile` Interface

```typescript
export interface Profile {
  // ... existing fields
  lastLoginAt?: Date;
  lastMessageSentAt?: Date;
  lastPostCreatedAt?: Date;
  lastFriendAcceptedAt?: Date;
  interactionScore: number;
  // ...
}
```

### Updated `UserSearchParams` Interface

```typescript
export interface UserSearchParams {
  query?: string;
  name?: string;                 // NEW
  level?: Profile['level'];
  bikeType?: Profile['bikeType'];
  city?: string;
  distance?: number;              // NEW: in kilometers
  userLatitude?: number;          // NEW: for distance calculation
  userLongitude?: number;         // NEW: for distance calculation
}
```

## User Interface Changes

### Discovery Page (`/users`)

New UI elements:
1. **Name Search Input**: Dedicated field at the top for searching by name
2. **Distance Filter Slider**: Appears when user has location data
   - Range: 0 (All) to 500 kilometers
   - Visual markers at 1km, 100km, 200km, 300km, and "All"
   - Smooth gradient slider design matching app theme

### Translations

Added to English (`en.json`):
```json
"searchByName": "Search by name...",
"distanceFilter": "Distance",
"allDistances": "All",
"all": "All"
```

Added to Spanish (`es.json`):
```json
"searchByName": "Buscar por nombre...",
"distanceFilter": "Distancia",
"allDistances": "Todas",
"all": "Todas"
```

## Usage Instructions

### For Administrators

1. **Run the migration** to add the new database fields:
   ```bash
   cd apps/backend
   npm run migrate:up
   ```

2. The interaction score will be calculated automatically for all users based on their activity

3. Existing users will have a score of 0 until they perform tracked activities

### For Users

1. **View Active Users**: Navigate to the Discover page (`/users`) to see users sorted by activity level

2. **Search by Name**: Use the top search field to find specific users by name

3. **Filter by Distance**: 
   - Ensure your profile has location data (city with coordinates)
   - Use the distance slider to find users within a specific radius
   - Move slider to position 0 (leftmost) to see all users

4. **Combine Filters**: All filters can be used together for precise searching

## Technical Considerations

### Performance

- Indexes on `interaction_score` and `last_login_at` ensure fast sorting and querying
- Distance calculation uses efficient Haversine formula in SQL
- Exponential decay calculation is performed at the database level using triggers

### Score Accuracy

- Scores are automatically recalculated when any tracked timestamp is updated
- The trigger ensures consistency without application-level logic
- Exponential decay naturally penalizes inactivity over time

### Privacy

- Distance filter only works if users have shared their location
- Location data is optional and controlled by the user
- Only city-level location is displayed in profiles

## Future Enhancements

Potential improvements for future iterations:

1. **Additional Activity Tracking**:
   - Comments on posts
   - Group participation
   - Event attendance
   - Route uploads

2. **Weighted Scoring**:
   - Allow administrators to adjust activity weights
   - Different scoring for different user types

3. **Time-based Boosts**:
   - Temporary score boosts for special events
   - Seasonal activity considerations

4. **Advanced Filtering**:
   - Combine distance with other filters (e.g., bike type within X km)
   - Save favorite search combinations

5. **Score Display**:
   - Show activity indicators on user profiles
   - "Active user" badges for high scores
   - Activity streaks and achievements

## Testing Notes

Due to environment limitations, the following manual tests should be performed:

1. **Migration**: Verify the migration runs without errors
2. **Score Calculation**: Test that scores update correctly after activities
3. **Distance Filter**: Test with various user locations
4. **Name Search**: Verify accurate name matching
5. **Combined Filters**: Test multiple filters simultaneously
6. **Performance**: Monitor query performance with large user datasets

## Files Modified

### Backend
- `apps/backend/migrations/1765500119714_add-user-interaction-fields.mjs` (NEW)
- `apps/backend/src/app/api/users/route.ts`
- `apps/backend/src/app/api/auth/login/route.ts`
- `apps/backend/src/app/api/messages/route.ts`
- `apps/backend/src/app/api/posts/route.ts`
- `apps/backend/src/app/api/friend-requests/route.ts`
- `apps/backend/src/lib/utils.ts`

### Shared Types
- `packages/config/src/types.ts`

### Frontend
- `apps/web/src/app/users/page.tsx`
- `apps/web/src/app/users/users.module.css`
- `apps/web/src/messages/en.json`
- `apps/web/src/messages/es.json`

## Conclusion

This implementation provides a comprehensive user interaction tracking and discovery system that helps users find and connect with active members of the cycling community. The exponential decay scoring ensures that the rankings stay fresh and relevant, while the enhanced filtering options make it easy to find specific types of users.
