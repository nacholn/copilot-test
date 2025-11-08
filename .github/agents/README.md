# GitHub Copilot Agents for Cycling Network Platform

This directory contains specialized agent configurations for different parts of the Cycling Network Platform monorepo. Each agent is an expert in a specific domain and can help you develop features faster and more consistently.

## Available Agents

### 1. Backend API Agent (`backend-api-agent.md`)
**Expertise**: Next.js API routes, server-side operations, Supabase server auth

**Use when**:
- Creating new API endpoints
- Implementing backend business logic
- Handling server-side authentication
- Working with database operations
- Building RESTful APIs

**Example prompts**:
- "Create a new API endpoint to fetch user routes"
- "Add authentication middleware to protect an endpoint"
- "Implement pagination for the activities list endpoint"

### 2. Web PWA Agent (`web-pwa-agent.md`)
**Expertise**: Next.js web app, React components, PWA features, responsive design

**Use when**:
- Building web pages and components
- Implementing client-side authentication
- Adding PWA features (offline, installability)
- Creating responsive layouts
- Integrating with the backend API

**Example prompts**:
- "Create a profile page with user information"
- "Add a navigation menu component"
- "Implement dark mode toggle"

### 3. Mobile App Agent (`mobile-app-agent.md`)
**Expertise**: Expo, React Native, mobile UX, native device features

**Use when**:
- Creating mobile screens
- Implementing mobile-specific features
- Working with native device APIs
- Building mobile navigation
- Optimizing for iOS and Android

**Example prompts**:
- "Create a route details screen"
- "Add camera integration for profile photos"
- "Implement pull-to-refresh on the activities list"

### 4. Shared UI Agent (`shared-ui-agent.md`)
**Expertise**: Cross-platform components, design systems, accessibility

**Use when**:
- Creating reusable UI components
- Building components that work on web and mobile
- Implementing design system patterns
- Ensuring accessibility across platforms
- Maintaining component consistency

**Example prompts**:
- "Create a Card component for both web and mobile"
- "Add a Modal component with accessibility features"
- "Build an Input component with validation"

### 5. Config Package Agent (`config-package-agent.md`)
**Expertise**: TypeScript types, Supabase clients, shared configuration

**Use when**:
- Adding new shared types
- Updating Supabase client configuration
- Creating utility functions used across apps
- Defining API response types
- Managing environment variable patterns

**Example prompts**:
- "Add types for the new route sharing feature"
- "Create a utility to format dates consistently"
- "Add a new API response type"

## How to Use Agents

### Method 1: Direct File Prompt
Copy the agent's markdown content and paste it into your Copilot chat along with your request:

```
[Paste backend-api-agent.md content]

Create a new API endpoint at /api/routes that returns all routes for the authenticated user.
```

### Method 2: Reference in Prompt
Reference the agent file in your prompt:

```
@backend-api-agent Create a new API endpoint at /api/routes that returns all routes for the authenticated user.
```

### Method 3: Context Setting
Set the agent as context at the start of your work session:

```
I'm working on the backend API. Use the backend-api-agent guidelines.

Now, create a new endpoint...
```

## Agent Selection Guide

| Task | Recommended Agent |
|------|------------------|
| API endpoint | Backend API Agent |
| Web page/component | Web PWA Agent |
| Mobile screen/feature | Mobile App Agent |
| Reusable UI component | Shared UI Agent |
| Type definitions | Config Package Agent |
| Database schema | Config Package Agent |
| Authentication flow | Backend API + Web/Mobile Agent |
| Cross-platform component | Shared UI Agent |

## Best Practices

1. **Choose the Right Agent**: Use the agent that matches your current task
2. **Combine Agents**: For full-stack features, use multiple agents in sequence
3. **Follow Patterns**: Agents enforce consistent patterns across the codebase
4. **Read the Docs**: Each agent includes examples and best practices
5. **Iterate**: Ask follow-up questions to refine the output

## Multi-Agent Workflows

### Creating a Full Feature (e.g., Route Sharing)

1. **Config Package Agent**: Add shared types
   ```
   Add types for RouteShare and SharePermission
   ```

2. **Backend API Agent**: Create API endpoints
   ```
   Create endpoints to share/unshare routes
   ```

3. **Shared UI Agent**: Build reusable components
   ```
   Create ShareButton component for web and mobile
   ```

4. **Web PWA Agent**: Implement web UI
   ```
   Add share button to route details page
   ```

5. **Mobile App Agent**: Implement mobile UI
   ```
   Add share functionality to route screen
   ```

## Agent Configuration Files

Each agent file contains:
- **Responsibilities**: What the agent specializes in
- **Project Context**: Location, stack, dependencies
- **Coding Standards**: Patterns and best practices
- **Key Files**: Important files to reference
- **Common Tasks**: Typical operations
- **Testing**: How to test changes
- **Remember**: Important reminders

## Updating Agents

When the project evolves:
1. Update agent files with new patterns
2. Add new examples as features are built
3. Document common pitfalls and solutions
4. Keep coding standards current

## Contributing

When you discover a useful pattern:
1. Add it to the relevant agent file
2. Include examples
3. Document the use case
4. Update this README if needed

---

**Pro Tip**: Keep agent files open in your editor tabs while working. This helps Copilot understand the project context better!
