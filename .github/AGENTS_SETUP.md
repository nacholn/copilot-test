# GitHub Copilot Custom Agents Setup

## Overview

This repository now has 5 custom GitHub Copilot agents configured to help with development tasks. Each agent is specialized for a specific part of the stack.

## What Was Fixed

### Problem

The repository had agent markdown files in `.github/agents/` directory, but they weren't being recognized as custom agents by GitHub Copilot.

### Solution

Created `.github/agents.json` configuration file that registers the agents with GitHub Copilot.

## Configured Agents

| Agent Name            | Usage               | Purpose                                                               |
| --------------------- | ------------------- | --------------------------------------------------------------------- |
| `@backend-api`        | Backend development | Next.js 14 API routes, PostgreSQL operations, Supabase authentication |
| `@database-migration` | Database schema     | PostgreSQL schema design, node-pg-migrate migrations                  |
| `@react-native-ui`    | UI components       | Cross-platform React Native components for iOS, Android, Web          |
| `@expo-mobile`        | Mobile development  | Expo mobile app with expo-router navigation                           |
| `@nextjs-web`         | Web development     | Next.js 14 web app with PWA configuration                             |

## How to Use

### In GitHub Copilot Chat

Use the `@` symbol followed by the agent name:

```
@backend-api create an endpoint to update user preferences
@database-migration add a new table for cycling routes
@react-native-ui create a Button component with loading state
@expo-mobile create a profile edit screen
@nextjs-web create a dashboard page with SSR
```

### Example Workflow

When building a new feature that spans multiple parts of the stack:

1. **Database First**

   ```
   @database-migration create a 'posts' table with user_id, title, content, and timestamps
   ```

2. **Backend API**

   ```
   @backend-api create CRUD endpoints for posts at /api/posts
   ```

3. **Shared UI Components**

   ```
   @react-native-ui create a PostCard component to display post information
   ```

4. **Mobile App**

   ```
   @expo-mobile create a posts list screen using the PostCard component
   ```

5. **Web App**
   ```
   @nextjs-web create a posts page with server-side rendering
   ```

## Configuration Files

### `.github/agents.json`

The main configuration file that maps agent names to their prompt files.

**Structure:**

```json
{
  "agents": [
    {
      "name": "backend-api",
      "description": "Expert in Next.js 14 API routes...",
      "prompt_file": "agents/backend-api-agent.md",
      "tags": ["backend", "api", "nextjs", "postgresql", "supabase"]
    }
  ]
}
```

### Agent Prompt Files

Located in `.github/agents/` directory:

- `backend-api-agent.md` - Backend development expertise
- `database-migration-agent.md` - Database schema expertise
- `react-native-ui-agent.md` - Cross-platform UI expertise
- `expo-mobile-agent.md` - Mobile app expertise
- `nextjs-web-agent.md` - Web app expertise

## Validation

A validation script is available to verify the configuration:

```bash
node /tmp/validate-agents.js
```

This checks:

- ✅ Valid JSON syntax
- ✅ Required fields present
- ✅ Prompt files exist
- ✅ No duplicate agent names

## Testing the Setup

### 1. Check Agent Availability

Open GitHub Copilot Chat and type `@` - you should see the custom agents listed.

### 2. Test an Agent

Try a simple request:

```
@backend-api what endpoints should I create for user authentication?
```

### 3. Verify Agent Context

Agents should understand:

- Project structure (Turborepo monorepo)
- Technology stack (Next.js, Expo, PostgreSQL)
- Coding patterns and conventions
- Location of relevant files

## Troubleshooting

### Agents Not Appearing

1. Ensure you have GitHub Copilot enabled
2. Check that `.github/agents.json` exists and is valid JSON
3. Verify all prompt files referenced in `agents.json` exist
4. Restart your IDE/editor

### Agent Not Understanding Context

1. Provide more context in your request
2. Reference specific files or patterns
3. Use the agent's tags to help it understand what you need

### Validation Errors

Run the validation script to check for configuration issues:

```bash
node /tmp/validate-agents.js
```

## Maintenance

### Adding a New Agent

1. Create the agent prompt file in `.github/agents/`
2. Add the agent configuration to `.github/agents.json`
3. Update `.github/agents/README.md` with usage examples
4. Run validation to ensure everything is correct

### Updating an Agent

1. Edit the agent's markdown file in `.github/agents/`
2. The changes will be picked up by GitHub Copilot automatically
3. No need to modify `agents.json` unless changing the name

### Removing an Agent

1. Remove the entry from `.github/agents.json`
2. Optionally delete the agent's markdown file
3. Update documentation

## Additional Resources

- [GitHub Copilot Custom Agents Documentation](https://docs.github.com/en/copilot)
- [Agent Usage Guide](.github/agents/README.md)
- [Repository Copilot Instructions](.github/copilot-instructions.md)

## Questions?

If you encounter issues or have questions about the agents:

1. Check the `.github/agents/README.md` for usage examples
2. Verify your GitHub Copilot subscription is active
3. Run the validation script to check for configuration errors
4. Review the agent prompt files to understand their capabilities
