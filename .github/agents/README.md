# GitHub Copilot Agents

This directory contains specialized Copilot agent configurations for the Cyclists Social Network monorepo. Each agent is an expert in a specific domain and can help you write better code faster.

## Available Agents

### 1. Backend API Development Agent
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
> Using the backend API agent, create a new endpoint to retrieve cycling routes for a user

---

### 2. Database Migration Agent
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
> Using the database migration agent, create a migration to add a 'cycling_routes' table with appropriate indexes

---

### 3. React Native UI Component Agent
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
> Using the React Native UI agent, create a Card component that works on all platforms

---

### 4. Expo Mobile Development Agent
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
> Using the Expo mobile agent, create a profile edit screen with form validation

---

### 5. Next.js Web Development Agent
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
> Using the Next.js web agent, create a dashboard page that fetches user statistics

---

## How to Use Agents

### Method 1: Direct Reference
Mention the agent in your prompt:

```
Using the [agent name], create [feature]
```

Example:
```
Using the backend API agent, create an endpoint to update user preferences
```

### Method 2: Context Loading
Copy relevant sections from the agent file into your conversation for more detailed guidance.

### Method 3: File Reference
When asking Copilot to generate code, reference the agent file:

```
Based on backend-api-agent.md, implement a new authentication endpoint
```

## Agent Selection Guide

| Task | Recommended Agent |
|------|------------------|
| Create API endpoint | Backend API Development Agent |
| Add database table | Database Migration Agent |
| Build shared button | React Native UI Component Agent |
| Create mobile screen | Expo Mobile Development Agent |
| Build web page | Next.js Web Development Agent |
| Modify profile schema | Database Migration Agent |
| Add navigation | Expo Mobile Agent (mobile) or Next.js Web Agent (web) |
| Style component | React Native UI Agent (shared) or Next.js Web Agent (web-only) |
| Handle authentication | Backend API Agent (API) + Expo/Next.js Agent (UI) |

## Combining Agents

For complex features, you may need multiple agents:

**Example: Adding a New Feature**

1. **Database Migration Agent**: Create database schema
   ```
   Using the database migration agent, create tables for cycling routes
   ```

2. **Backend API Agent**: Create API endpoints
   ```
   Using the backend API agent, create CRUD endpoints for routes
   ```

3. **React Native UI Agent**: Create shared components
   ```
   Using the React Native UI agent, create a RouteCard component
   ```

4. **Expo Mobile Agent**: Create mobile screens
   ```
   Using the Expo mobile agent, create a routes list screen
   ```

5. **Next.js Web Agent**: Create web pages
   ```
   Using the Next.js web agent, create a routes dashboard page
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

**Step 1 - Database (Migration Agent):**
```
Using the database migration agent, create a user_preferences table with:
- user_id (foreign key to profiles)
- theme (dark/light)
- notifications_enabled (boolean)
- language (varchar)
```

**Step 2 - API (Backend API Agent):**
```
Using the backend API agent, create:
- GET /api/preferences?userId=<id>
- PATCH /api/preferences?userId=<id>
```

**Step 3 - UI (React Native UI Agent):**
```
Using the React Native UI agent, create a SettingsToggle component for preferences
```

**Step 4 - Mobile (Expo Mobile Agent):**
```
Using the Expo mobile agent, create a settings screen using the SettingsToggle
```

**Step 5 - Web (Next.js Web Agent):**
```
Using the Next.js web agent, create a settings page with the same functionality
```

### Example 2: Quick Component Creation

**Single Agent:**
```
Using the React Native UI agent, create a CyclingStatCard component that displays:
- Distance (in km)
- Duration (in minutes)
- Elevation gain (in meters)
- Average speed (in km/h)

Should be styled with a white background, rounded corners, and shadow.
```

### Example 3: Full Stack Feature

**Combined Agents:**
```
I need to add a "favorite routes" feature. Using:
1. Database migration agent: Create favorites table
2. Backend API agent: Create add/remove favorite endpoints
3. React Native UI agent: Create FavoriteButton component
4. Expo mobile agent: Integrate into route list screen
5. Next.js web agent: Add favorites page
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
