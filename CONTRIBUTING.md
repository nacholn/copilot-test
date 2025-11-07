# Contributing Guide

Thank you for your interest in contributing to this project! This guide will help you get started.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Give constructive feedback
- Focus on what is best for the community

## Getting Started

### Prerequisites
- Node.js v16 or higher
- npm v7 or higher
- Git
- A GitHub account

### Setting Up Development Environment

1. Fork the repository on GitHub

2. Clone your fork:
```bash
git clone https://github.com/YOUR_USERNAME/copilot-test.git
cd copilot-test
```

3. Add upstream remote:
```bash
git remote add upstream https://github.com/nacholn/copilot-test.git
```

4. Install dependencies:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

5. Set up environment variables:
```bash
# Backend
cd backend
cp .env.example .env

# Frontend
cd ../frontend
cp .env.example .env
```

## Development Workflow

### Creating a Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests

### Making Changes

1. **Write clean code** following the project's style guide
2. **Test your changes** thoroughly
3. **Update documentation** if needed
4. **Commit frequently** with clear messages

### Commit Messages

Follow conventional commit format:

```
type(scope): subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(backend): add user authentication endpoint

fix(frontend): resolve user list loading issue

docs(readme): update installation instructions

test(backend): add tests for user controller
```

### Testing

#### Backend Tests
```bash
cd backend
npm test
npm test -- --coverage
```

#### Frontend Tests
```bash
cd frontend
npm test
npm test -- --coverage --watchAll=false
```

All tests must pass before submitting a pull request.

### Code Style

#### Backend (JavaScript/Node.js)
- Use ES6+ features
- Use `const` and `let`, avoid `var`
- Use async/await over callbacks
- Add JSDoc comments for complex functions
- Follow existing code patterns

#### Frontend (React)
- Use functional components with hooks
- Keep components small and focused
- Use meaningful component and variable names
- Follow React best practices
- Use PropTypes or TypeScript for type checking (if adopted)

### Running the Application

#### Development Mode

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm start
```

#### Using Docker
```bash
docker-compose up -d
```

## Submitting Changes

### Before Submitting

1. **Pull latest changes** from upstream:
```bash
git fetch upstream
git rebase upstream/main
```

2. **Run tests**:
```bash
cd backend && npm test
cd ../frontend && npm test
```

3. **Check code quality**:
```bash
# Lint your code if linters are set up
npm run lint
```

4. **Update documentation** if necessary

### Creating a Pull Request

1. Push your branch to your fork:
```bash
git push origin feature/your-feature-name
```

2. Go to GitHub and create a Pull Request from your fork to the main repository

3. Fill in the PR template:
   - Clear title describing the change
   - Detailed description of what was changed and why
   - Link to any related issues
   - Screenshots for UI changes
   - Testing steps

4. Wait for review and address feedback

### Pull Request Guidelines

- **One feature per PR**: Keep PRs focused and manageable
- **Clear description**: Explain what and why, not just how
- **Update documentation**: Include relevant documentation updates
- **Add tests**: New features should include tests
- **Follow code style**: Match the existing code style
- **Keep it small**: Smaller PRs are easier to review

## Review Process

1. Automated checks will run (tests, linting)
2. Maintainers will review your code
3. Address any feedback or requested changes
4. Once approved, your PR will be merged

## Types of Contributions

### Bug Reports

Use GitHub Issues to report bugs. Include:
- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details (OS, Node version, etc.)

### Feature Requests

Use GitHub Issues to suggest features. Include:
- Clear description of the feature
- Use case and benefits
- Proposed implementation (optional)
- Mockups or examples (optional)

### Documentation

Documentation improvements are always welcome:
- Fix typos or unclear explanations
- Add examples
- Improve setup instructions
- Add troubleshooting guides

### Code Contributions

Areas where contributions are welcome:
- Bug fixes
- New features (discuss first in an issue)
- Test coverage improvements
- Performance improvements
- Refactoring

## Development Tips

### Backend Development
- Use Postman or curl to test API endpoints
- Check server logs for errors
- Use debugger or console.log for troubleshooting
- Write tests for new endpoints

### Frontend Development
- Use React DevTools for debugging
- Check browser console for errors
- Test in multiple browsers if changing core functionality
- Write tests for new components

### Common Tasks

#### Adding a New Backend Endpoint
1. Create controller function
2. Add route definition
3. Write tests
4. Update API documentation

#### Adding a New React Component
1. Create component file and CSS
2. Import and use in parent component
3. Add tests
4. Update documentation if needed

## Getting Help

- **Questions**: Open a GitHub Discussion or Issue
- **Chat**: Join our community chat (if available)
- **Documentation**: Check README and agent documentation in `/docs/.agents/`

## License

By contributing, you agree that your contributions will be licensed under the project's ISC License.

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes (for significant contributions)
- CONTRIBUTORS.md file (if created)

## Additional Resources

- [GitHub Flow Guide](https://guides.github.com/introduction/flow/)
- [How to Write Good Commit Messages](https://chris.beams.io/posts/git-commit/)
- [Code Review Best Practices](https://google.github.io/eng-practices/review/)

Thank you for contributing! 🎉
