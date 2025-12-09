# Groups Feature Guide

## Overview

The Groups feature has been successfully implemented in the Cyclists Social Network application. This feature allows users to create, join, and participate in cycling groups with messaging capabilities.

## Features Implemented

### 1. Database Schema

Four new tables have been created:

#### `groups` Table
- `id` (UUID): Primary key
- `name` (VARCHAR): Group name
- `description` (TEXT): Optional group description
- `location` (VARCHAR): City name or "general" for global groups
- `avatar` (TEXT): Main group image URL
- `created_by` (UUID): Creator's user ID (admin by default)
- `created_at`, `updated_at`: Timestamps

#### `group_members` Table
- `id` (UUID): Primary key
- `group_id` (UUID): Reference to groups
- `user_id` (UUID): Reference to profiles
- `role` (VARCHAR): "admin" or "member"
- `joined_at` (TIMESTAMP): When user joined
- Unique constraint on (group_id, user_id)

#### `group_images` Table
- `id` (UUID): Primary key
- `group_id` (UUID): Reference to groups
- `image_url` (TEXT): Image URL from Cloudinary
- `cloudinary_public_id` (VARCHAR): Cloudinary identifier
- `is_primary` (BOOLEAN): Whether this is the main image
- `display_order` (INTEGER): Order for display
- `created_at` (TIMESTAMP): Upload timestamp

#### `group_messages` Table
- `id` (UUID): Primary key
- `group_id` (UUID): Reference to groups
- `sender_id` (UUID): Reference to profiles
- `message` (TEXT): Message content
- `created_at` (TIMESTAMP): When message was sent

#### `group_message_reads` Table
- `id` (UUID): Primary key
- `group_id` (UUID): Reference to groups
- `user_id` (UUID): Reference to profiles
- `last_read_message_id` (UUID): Last message read by user
- `last_read_at` (TIMESTAMP): When last read
- Unique constraint on (group_id, user_id)

### 2. API Endpoints

All endpoints are RESTful and follow the existing API patterns.

#### Group Management
- **POST** `/api/groups` - Create a new group
- **GET** `/api/groups` - List all groups (with optional filters: location, query, userId)
- **GET** `/api/groups/:groupId` - Get group details with member count and images
- **PATCH** `/api/groups/:groupId` - Update group (admin only)
- **DELETE** `/api/groups/:groupId` - Delete group (admin only)

#### Group Membership
- **POST** `/api/groups/:groupId/join` - Join a group
- **POST** `/api/groups/:groupId/leave` - Leave a group (prevents last admin from leaving)
- **GET** `/api/groups/:groupId/members` - Get list of group members
- **DELETE** `/api/groups/:groupId/members?userId=xxx&requesterId=yyy` - Remove member (admin only)

#### Group Messaging
- **GET** `/api/groups/:groupId/messages` - Get group messages (members only)
- **POST** `/api/groups/:groupId/messages` - Send message to group (members only)
- **PATCH** `/api/groups/:groupId/messages` - Mark messages as read

#### User-Specific
- **GET** `/api/groups/my-groups?userId=xxx` - Get all groups user belongs to
- **GET** `/api/group-conversations?userId=xxx` - Get group chat list with unread counts

### 3. Web Frontend Pages

#### `/groups` - My Groups Page
- Lists all groups the user is a member of
- Shows group name, description, member count, and location
- Displays admin badge for groups where user is admin
- Empty state with links to create or discover groups
- Create Group button in header

#### `/groups/create` - Create Group Page
- Form to create a new group
- Fields: name (required), description, location
- Creator automatically becomes admin
- Redirects to group detail page after creation

#### `/groups/:groupId` - Group Detail Page
- Group profile with avatar, name, description, location
- Member count and admin indicators
- Join/Leave button based on membership status
- Edit button for admins
- Integrated messaging interface (for members only)
  - Shows sender names and avatars for each message
  - Message input with send button
  - Auto-scroll to latest messages
  - Read receipts tracking

#### `/users` (Updated) - Discover Page
- Added tabs for "Users" and "Groups"
- Groups tab shows all available groups
- Filters: search by name/description, filter by location
- Shows "Joined" badge for groups user is already in
- Click to navigate to group detail page

#### `/chat` (Updated) - Chat Interface
- Unified interface for both friend and group conversations
- Groups shown with 👥 emoji indicator
- Group messages display sender name and avatar
- Unread count badges for both friends and groups
- Sorted by last message time

### 4. TypeScript Types

All types added to `packages/config/src/types.ts`:

```typescript
// Core types
Group
GroupMember
GroupImage
GroupMessage
GroupMessageRead

// Extended types
GroupWithDetails (includes memberCount, isAdmin, isMember, images)
GroupConversation (for chat list)
GroupMessageWithSender (includes sender info)

// Input types
CreateGroupInput
UpdateGroupInput
SendGroupMessageInput
```

### 5. Translations

Added comprehensive translations in English and Spanish:
- Group navigation and labels
- Form placeholders and buttons
- Success/error messages
- Empty states and instructions
- Admin-specific messages

### 6. Navigation

Added "Groups" link to the main navigation header between "Requests" and "Chat".

## User Flows

### Creating a Group
1. User clicks "Create Group" button
2. Fills in group name (required), description, and location
3. Submits form
4. User becomes admin and is redirected to group page

### Joining a Group
1. User discovers group via "Discover" tab on Users page
2. Clicks on group to view details
3. Clicks "Join Group" button
4. User can now see and send messages

### Group Messaging
1. Member opens group detail page or selects group in chat
2. Sees existing messages with sender names
3. Types message in input field
4. Presses send or Enter
5. Message appears in chat for all members

### Leaving a Group
1. Member clicks "Leave Group" button
2. System prevents if user is the only admin
3. User is removed from group
4. Group disappears from "My Groups"

### Admin Actions
- **Edit Group**: Update name, description, location, avatar
- **Delete Group**: Remove entire group (requires confirmation)
- **Remove Members**: Kick members from group (can't remove last admin)

## Security Features

1. **Admin Authorization**: All admin actions verify user role
2. **Member Verification**: Message endpoints verify membership
3. **SQL Injection Prevention**: All queries use parameterized statements
4. **Role Validation**: Database check constraints enforce role values
5. **Last Admin Protection**: Prevents leaving/removal of sole admin

## Technical Decisions

### Why Separate group_message_reads Table?
Instead of tracking read status on each message (which would be inefficient for groups with many members), we track the last read message per user. This allows efficient calculation of unread counts.

### Why Not Full Real-Time?
WebSocket support for group messages is noted as a future enhancement. The current implementation uses polling/refresh which is simpler and sufficient for initial release. Real-time can be added by extending the existing WebSocket context.

### Why Unified Chat Interface?
Combining friend and group chats in one interface provides better UX - users don't need to switch between different chat screens. The type indicator (👥) clearly distinguishes groups.

## Database Migration

To apply the groups feature to your database:

```bash
cd apps/backend
npm run migrate:up
```

This will run migrations:
- `1765322342185_create-groups-tables.mjs`
- `1765322342186_add-group-message-notification-type.mjs`

## Future Enhancements

### Not Yet Implemented (Optional)
1. **Group Edit Page**: Dedicated page for admins to edit group details
2. **Real-Time Messaging**: WebSocket integration for instant group messages
3. **Group Image Gallery**: Similar to profile images, multiple images per group
4. **Member Roles**: More granular permissions beyond admin/member
5. **Group Notifications**: Push notifications for new group messages
6. **Group Events**: Calendar integration for group rides/events
7. **Group Statistics**: Activity tracking, popular groups, etc.
8. **Mobile App**: React Native screens for groups feature

## Testing Checklist

Before deployment, test the following:

- [ ] Create a new group
- [ ] Join an existing group
- [ ] Send messages in a group
- [ ] Leave a group
- [ ] Admin: Edit group details
- [ ] Admin: Remove a member
- [ ] Admin: Try to delete group
- [ ] Admin: Try to leave as sole admin (should fail)
- [ ] Verify unread counts work correctly
- [ ] Check group discovery and search
- [ ] Test chat interface with both friends and groups
- [ ] Verify translations in Spanish
- [ ] Test on mobile viewport

## API Usage Examples

### Create a Group
```typescript
POST /api/groups
Content-Type: application/json

{
  "name": "Mountain Bikers Madrid",
  "description": "Group for mountain biking enthusiasts in Madrid",
  "location": "Madrid",
  "createdBy": "user-uuid-here"
}
```

### Send Group Message
```typescript
POST /api/groups/{groupId}/messages
Content-Type: application/json

{
  "groupId": "group-uuid-here",
  "senderId": "user-uuid-here",
  "message": "Anyone up for a ride this weekend?"
}
```

### Get My Groups
```typescript
GET /api/groups/my-groups?userId={userId}
```

## Troubleshooting

### Build Errors
The build may fail during static generation if environment variables aren't set. This is expected - the app requires runtime environment variables (DATABASE_URL, SUPABASE_URL, etc.) to function.

### "User is not a member of this group"
This error occurs when trying to access group messages without being a member. Users must join the group first.

### "Only group admins can..."
Admin-only actions require the user to have the 'admin' role in group_members table. The creator is automatically made admin.

### Unread counts not updating
Make sure to call the PATCH endpoint for marking messages as read when users view the group messages.

## Maintenance

### Database Cleanup
- Cascade deletes are configured, so deleting a group removes all related data
- Regular cleanup of old messages may be needed for large groups

### Performance Optimization
- Group message queries are indexed for performance
- Consider pagination for groups with many messages
- Unread count calculation is optimized with a single query

## Conclusion

The Groups feature is fully functional and ready for testing. It provides a solid foundation for community building within the Cyclists Social Network, with room for future enhancements based on user feedback.
