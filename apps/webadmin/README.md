# WebAdmin Dashboard

Admin dashboard for managing groups in the Cyclists Social Network.

## Features

- **Group Management**
  - View all groups with member counts
  - Create new groups
  - Delete groups
  - Update group information

- **Member Management**
  - View all members in a group
  - Add users to groups
  - Remove users from groups
  - See member roles and join dates

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running on port 3001
- PostgreSQL database with groups tables

### Installation

```bash
# Install dependencies from root
cd ../..
npm install

# Or install for webadmin only
npm install --workspace=webadmin
```

### Configuration

Create a `.env` file based on `.env.example`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Running the App

```bash
# From root directory
npm run dev --workspace=webadmin

# Or from webadmin directory
cd apps/webadmin
npm run dev
```

The dashboard will be available at `http://localhost:3002`

## Usage

### Managing Groups

1. Navigate to `http://localhost:3002`
2. View all groups in the main dashboard
3. Click "Create Group" to add a new group
4. Click "Manage" on any group to view and manage members
5. Click "Delete" to remove a group (with confirmation)

### Managing Members

1. From the main dashboard, click "Manage" on a group
2. View all current members with their details
3. Click "Add Member" to add a user to the group
4. Select a user from the dropdown (shows only available users)
5. Click "Remove" next to any member to remove them from the group

## API Endpoints Used

- `GET /api/groups` - List all groups
- `POST /api/groups` - Create a new group
- `DELETE /api/groups/:id` - Delete a group
- `GET /api/groups/:id/members` - Get group members
- `POST /api/groups/:id/members` - Add member to group
- `DELETE /api/groups/:id/members/:userId` - Remove member from group
- `GET /api/profile/all` - Get all user profiles

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: CSS Modules
- **API Communication**: Fetch API
- **Shared Types**: @bicicita/config package

## Project Structure

```
apps/webadmin/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Main groups list page
│   │   └── groups/
│   │       └── [id]/
│   │           └── page.tsx      # Group detail/members page
│   ├── components/
│   │   ├── AddMemberModal.tsx
│   │   ├── CreateGroupModal.tsx
│   │   ├── GroupList.tsx
│   │   └── MemberList.tsx
│   └── styles/
│       └── common.module.css     # Shared styles
├── next.config.js
├── package.json
└── tsconfig.json
```

## Development

### Building

```bash
npm run build
```

### Linting

```bash
npm run lint
```

### Type Checking

```bash
npx tsc --noEmit
```

## Notes

- The app uses Next.js API rewrites to proxy requests to the backend on port 3001
- All user actions require confirmation for destructive operations (delete group, remove member)
- Only users not already in a group are shown in the "Add Member" dropdown
- The dashboard is responsive and works on different screen sizes
