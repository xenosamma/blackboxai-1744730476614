# Contributing to PWR CMS

First off, thank you for considering contributing to the Precious Waste Refinery CMS! It's people like you that make this project better.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

* Use a clear and descriptive title
* Describe the exact steps to reproduce the problem
* Provide specific examples to demonstrate the steps
* Describe the behavior you observed and what behavior you expected
* Include screenshots if possible
* Include error messages and stack traces
* Note your environment details (OS, Node.js version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

* Use a clear and descriptive title
* Provide a detailed description of the proposed functionality
* Explain why this enhancement would be useful
* Include mockups or examples if applicable

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run the tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/your-username/pwr-cms.git
cd pwr-cms
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp backend/.env.example backend/.env
```

4. Start development server:
```bash
npm run dev
```

## Coding Guidelines

### JavaScript Style Guide

* Follow the Airbnb JavaScript Style Guide
* Use ES6+ features when appropriate
* Add JSDoc comments for functions and classes
* Keep functions small and focused
* Use meaningful variable and function names

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

Example:
```
Add image optimization to media upload

- Implement Sharp for image processing
- Add support for multiple formats
- Optimize file size while maintaining quality

Fixes #123
```

### Testing Guidelines

* Write tests for new features
* Maintain existing tests
* Aim for high test coverage
* Test edge cases
* Use meaningful test descriptions

### Documentation

* Update README.md with new features
* Document new API endpoints
* Add JSDoc comments for new functions
* Update CHANGELOG.md for significant changes

## Project Structure

```
.
├── admin/              # Admin panel frontend
├── backend/           # Backend application
│   ├── config/       # Configuration files
│   ├── middleware/   # Express middleware
│   ├── models/       # MongoDB models
│   ├── routes/       # API routes
│   ├── services/     # Business logic
│   ├── scripts/      # Utility scripts
│   └── utils/        # Helper functions
├── uploads/          # Media uploads
└── logs/            # Application logs
```

## Code Review Process

1. A maintainer will review your PR
2. They may request changes or improvements
3. Once approved, your PR will be merged
4. Your contribution will be added to CHANGELOG.md

## Development Workflow

1. Pick an issue to work on
2. Create a new branch
3. Make your changes
4. Write/update tests
5. Update documentation
6. Submit PR
7. Respond to review comments
8. Get merged!

## Best Practices

### Security
* Never commit sensitive data
* Validate all user input
* Use security middleware
* Follow OWASP guidelines
* Keep dependencies updated

### Performance
* Optimize database queries
* Use caching when appropriate
* Minimize HTTP requests
* Optimize images and assets
* Follow performance best practices

### Accessibility
* Follow WCAG guidelines
* Use semantic HTML
* Provide alt text for images
* Ensure keyboard navigation
* Test with screen readers

## Getting Help

* Check the documentation
* Join our Discord channel
* Ask in GitHub issues
* Email the maintainers

## Recognition

Contributors will be:
* Added to CONTRIBUTORS.md
* Mentioned in release notes
* Recognized in project documentation

Thank you for contributing to PWR CMS! 🎉
