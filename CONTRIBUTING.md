# Contributing to Spotify Radio

Thank you for your interest in contributing! This guide will help you get started.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Spotify Premium account
- Git

### Setup

1. Fork and clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```
4. Fill in your API keys in `.env.local` (see [.env.example](.env.example))
5. Push the database schema:
   ```bash
   npm run db:push
   ```
6. Start the dev server:
   ```bash
   npm run dev
   ```

## Development Workflow

1. Create a branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes
3. Run linting and tests:
   ```bash
   npm run lint
   npm test
   ```
4. Commit with a descriptive message (see [Commit Convention](#commit-convention))
5. Push and open a pull request

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new station selector
fix: resolve token refresh race condition
docs: update README setup instructions
style: fix button alignment on mobile
refactor: simplify audio coordinator logic
test: add API route tests for favorites
chore: update dependencies
```

## Code Style

- **TypeScript** — strict mode enabled, no `any` types
- **React** — functional components with hooks
- **Tailwind CSS** — utility-first, use existing design tokens
- **ESLint** — run `npm run lint` before committing

## Project Structure

```
src/
  app/           # Next.js App Router pages and API routes
  components/    # React components (radio/, ui/, stats/)
  hooks/         # Custom React hooks
  store/         # Zustand state management
  lib/           # Utilities (db, validation, i18n, rate-limit)
  services/      # Business logic (Spotify API, DJ, audio)
  config/        # Station definitions, themes, i18n locales
  types/         # TypeScript type definitions
```

## Pull Request Guidelines

- Keep PRs focused — one feature or fix per PR
- Include a clear description of what changed and why
- Add tests for new functionality
- Ensure all existing tests pass
- Update documentation if needed

## Reporting Issues

Use the [GitHub issue templates](.github/ISSUE_TEMPLATE/) for:
- **Bug reports** — include steps to reproduce
- **Feature requests** — describe the use case

## Questions?

Open a [Discussion](../../discussions) on GitHub.
