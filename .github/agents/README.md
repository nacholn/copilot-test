# GitHub Copilot Agents

This directory contains specialized Copilot agent configurations for the Cyclists Social Network monorepo. Each agent is an expert in a specific domain and can help you write better code faster.

## Configuration

Custom agents are configured in `.github/agents.json` which maps agent names to their prompt files. GitHub Copilot reads this configuration to make the agents available.

## Available Agents

### 1. Backend API Development Agent

**Agent Name:** `@backend-api`  
**File:** `backend-api-agent.md`

**Expertise:**

- Next.js 14 API routes
- PostgreSQL database operations
- Supabase authentication
- RESTful API design
- Input validation and error handling

**Use When:**

- Creating new API endpoints
- Modifying database queries
- Implementing authentication flows
- Handling API errors
- Writing backend TypeScript code

**Example Prompt:**

> @backend-api create a new endpoint to retrieve cycling routes for a user

---

### 2. Database Migration Agent

**Agent Name:** `@database-migration`  
**File:** `database-migration-agent.md`

**Expertise:**

- PostgreSQL schema design
- node-pg-migrate API
- Database indexing strategies
- Migration best practices
- Data integrity and constraints

**Use When:**

- Creating new database tables
- Adding columns or indexes
- Modifying table constraints
- Writing migration scripts
- Rolling back changes

**Example Prompt:**

> @database-migration create a migration to add a 'cycling_routes' table with appropriate indexes

---

### 3. React Native UI Component Agent

**Agent Name:** `@react-native-ui`  
**File:** `react-native-ui-agent.md`

**Expertise:**

- React Native primitives
- Cross-platform components (iOS, Android, Web)
- StyleSheet API
- TypeScript with React Native
- Component architecture

**Use When:**

- Creating shared UI components
- Building cross-platform interfaces
- Styling with StyleSheet
- Ensuring iOS/Android/Web compatibility
- Writing component TypeScript types

**Example Prompt:**

> @react-native-ui create a Card component that works on all platforms

---

### 4. Expo Mobile Development Agent

**Agent Name:** `@expo-mobile`  
**File:** `expo-mobile-agent.md`

**Expertise:**

- Expo SDK and configuration
- expo-router navigation
- Mobile screens and layouts
- React Native mobile patterns
- Authentication flows

**Use When:**

- Creating mobile screens
- Implementing navigation
- Building forms and lists
- Handling mobile-specific features
- Working with Expo APIs

**Example Prompt:**

> @expo-mobile create a profile edit screen with form validation

---

### 5. Next.js Web Development Agent

**Agent Name:** `@nextjs-web`  
**File:** `nextjs-web-agent.md`

**Expertise:**

- Next.js 14 App Router
- PWA configuration
- Server and client components
- CSS Modules styling
- SEO and metadata

**Use When:**

- Creating web pages
- Implementing PWA features
- Styling with CSS Modules
- Fetching data (SSR/SSG)
- Setting up routes and layouts

**Example Prompt:**

> @nextjs-web create a dashboard page that fetches user statistics

---

## How to Use Agents

### Method 1: @ Mention (Recommended)

Use the @ symbol followed by the agent name in your prompt:

```
@backend-api create an endpoint to update user preferences
```

This is the standard way to invoke custom GitHub Copilot agents.

### Method 2: Direct Request

You can also request an agent by name:

```
Can the backend API agent help me create an authentication endpoint?
```

### Method 3: Context-Aware

Copilot will automatically suggest relevant agents based on:

- File location (e.g., files in `apps/backend/` might trigger the backend-api agent)
- File type (e.g., migration files trigger the database-migration agent)
- Current context and conversation

## Agent Selection Guide

| Task                   | Agent Command         | Description                     |
| ---------------------- | --------------------- | ------------------------------- |
| Create API endpoint    | `@backend-api`        | Backend API Development Agent   |
| Add database table     | `@database-migration` | Database Migration Agent        |
| Build shared button    | `@react-native-ui`    | React Native UI Component Agent |
| Create mobile screen   | `@expo-mobile`        | Expo Mobile Development Agent   |
| Build web page         | `@nextjs-web`         | Next.js Web Development Agent   |
| Modify profile schema  | `@database-migration` | Database Migration Agent        |
| Add mobile navigation  | `@expo-mobile`        | Expo Mobile Agent               |
| Add web navigation     | `@nextjs-web`         | Next.js Web Agent               |
| Style shared component | `@react-native-ui`    | React Native UI Agent           |
| Handle authentication  | `@backend-api`        | Backend API Agent               |

## Combining Agents

For complex features, you may need multiple agents. Here's how to work with them sequentially:

**Example: Adding a New Feature**

1. **Database Migration Agent**: Create database schema

   ```
   @database-migration create tables for cycling routes with user_id, name, distance, and elevation
   ```

2. **Backend API Agent**: Create API endpoints

   ```
   @backend-api create CRUD endpoints for cycling routes at /api/routes
   ```

3. **React Native UI Agent**: Create shared components

   ```
   @react-native-ui create a RouteCard component that displays route information
   ```

4. **Expo Mobile Agent**: Create mobile screens

   ```
   @expo-mobile create a routes list screen that uses the RouteCard component
   ```

5. **Next.js Web Agent**: Create web pages
   ```
   @nextjs-web create a routes dashboard page that fetches and displays routes
   ```

## Tips for Effective Agent Use

1. **Be Specific**: Clearly state which agent you want to use
2. **Provide Context**: Mention related files or existing code
3. **Follow Patterns**: Agents use established patterns from the codebase
4. **Iterate**: Start with the agent's suggestion and refine as needed
5. **Combine Expertise**: Use multiple agents for full-stack features

## Agent Maintenance

These agents are tailored to this project's:

- Technology stack (Next.js, Expo, PostgreSQL)
- Architecture patterns
- Code conventions
- Best practices

As the project evolves, consider:

- Updating agents with new patterns
- Adding new specialized agents
- Removing outdated recommendations

## Examples

### Example 1: User Preferences Feature

**Step 1 - Database:**

```
@database-migration create a user_preferences table with:
- user_id (foreign key to profiles)
- theme (dark/light)
- notifications_enabled (boolean)
- language (varchar)
```

**Step 2 - API:**

```
@backend-api create GET and PATCH endpoints at /api/preferences for user preferences
```

**Step 3 - UI Components:**

```
@react-native-ui create a SettingsToggle component for preferences with dark/light theme support
```

**Step 4 - Mobile:**

```
@expo-mobile create a settings screen using the SettingsToggle component
```

**Step 5 - Web:**

```
@nextjs-web create a settings page with the same functionality as the mobile version
```

### Example 2: Quick Component Creation

**Single Agent:**

```
@react-native-ui create a CyclingStatCard component that displays:
- Distance (in km)
- Duration (in minutes)
- Elevation gain (in meters)
- Average speed (in km/h)

Should be styled with a white background, rounded corners, and shadow.
```

### Example 3: Full Stack Feature

**Multiple Agents in Sequence:**

```
I need to add a "favorite routes" feature.

@database-migration create a favorites table with user_id and route_id

@backend-api create POST /api/favorites and DELETE /api/favorites/:id endpoints

@react-native-ui create a FavoriteButton component with heart icon

@expo-mobile integrate FavoriteButton into the route list screen

@nextjs-web add favorites page that displays user's favorite routes
```

## Getting Help

If you're unsure which agent to use:

1. Describe what you want to build
2. Ask: "Which Copilot agent should I use for [task]?"
3. Copilot will recommend the appropriate agent(s)

## Contributing

To improve these agents:

1. Note patterns that work well in the codebase
2. Document new best practices
3. Update agent files with examples
4. Keep agents focused on their domain

---

**Note:** These agents are designed to work with GitHub Copilot and provide context-specific guidance. They complement the main `copilot-instructions.md` file by offering specialized expertise for different parts of the stack.
