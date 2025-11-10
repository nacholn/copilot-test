# Contributing to Cyclists Social Network

Thank you for your interest in contributing! This guide will help you get started.

## Development Workflow

1. **Fork and Clone**: Fork this repository and clone it locally
2. **Create a Branch**: Create a feature branch from `main`
3. **Make Changes**: Implement your changes following our coding standards
4. **Test**: Ensure all tests pass and the project builds successfully
5. **Submit PR**: Push your branch and create a pull request

## Coding Standards

### TypeScript
- Use TypeScript for all new code
- Enable strict mode
- Define explicit types for function parameters and return values
- Avoid `any` types when possible

### Code Style
- Run `npm run format` before committing
- Follow existing code patterns in the repository
- Use meaningful variable and function names
- Add comments for complex logic

### Component Guidelines
- Keep components small and focused
- Use functional components with hooks
- Separate business logic from presentation
- Make components reusable when possible

### API Guidelines
- Use RESTful conventions
- Return consistent response formats
- Include proper error handling
- Validate input data

## Testing

### Before Submitting a PR
```bash
# Build all packages and apps
npm run build

# Run linters
npm run lint

# Format code
npm run format

# Run tests (when available)
npm run test
```

### Manual Testing
- Test your changes in all affected apps
- Test on different screen sizes (mobile/tablet/desktop)
- Verify authentication flows work correctly
- Check database operations complete successfully

## Commit Messages

Follow conventional commit format:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Examples:
```
feat: add route sharing feature
fix: resolve login redirect issue
docs: update setup instructions
```

## Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure CI checks pass
4. Request review from maintainers
5. Address review feedback
6. Squash commits if requested

## Project Structure

```
cyclists-social-network/
├── apps/              # Applications
│   ├── backend/       # API server
│   ├── web/          # Web app
│   └── mobile/       # Mobile app
├── packages/          # Shared packages
│   ├── config/       # Types & Supabase
│   └── ui/          # UI components
└── docs/            # Documentation
```

## Working with Workspaces

### Installing Dependencies
```bash
# Install for specific workspace
npm install <package> --workspace=apps/backend

# Install dev dependency
npm install -D <package> --workspace=packages/ui
```

### Running Scripts
```bash
# Run script in specific workspace
npm run dev --workspace=apps/web

# Run script in all workspaces
npm run build
```

## Adding New Features

### Adding a New API Endpoint
1. Create route file in `apps/backend/src/app/api/`
2. Add type definitions in `packages/config/src/types.ts`
3. Update API documentation
4. Add error handling
5. Test thoroughly

### Adding a New UI Component
1. Create component in `packages/ui/src/components/`
2. Export from `packages/ui/src/index.ts`
3. Add TypeScript types
4. Make it cross-platform compatible
5. Document props and usage

### Adding a New Page
1. Create page in app router structure
2. Implement UI using shared components
3. Add routing/navigation
4. Test responsiveness
5. Update navigation menus

## Database Changes

When modifying the database schema:
1. Update SQL in `apps/backend/src/lib/db.ts`
2. Update TypeScript types in `packages/config/src/types.ts`
3. Create migration script if needed
4. Document changes in PR description
5. Test with sample data

## Questions?

- Open an issue for bugs or feature requests
- Join our community discussions
- Check existing issues and PRs first

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Follow project guidelines

Thank you for contributing! 🚴
