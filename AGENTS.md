# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js 14 application written in TypeScript. Route pages live in
`pages/`, including the catch-all Hono API route under `pages/api/`. Reusable
UI is organized by feature in `components/`; shared React hooks, contexts,
utilities, schemas, and database types are in `hooks/`, `context/`, `utils/`,
`schemas/`, and `types/`. API use cases are under `api_src/`. Hymn data and
search/index generation belong to `scripts/`, `hymnsData/`, and `search/`.
Static assets and PWA metadata are in `public/`. Tests and Storybook stories
are colocated with their components (for example,
`components/Welcome/Welcome.test.tsx`).

## Build, Test, and Development Commands

Use Node 22 and pnpm with the committed `pnpm-lock.yaml`:

- `pnpm dev` starts the local Next.js development server.
- `pnpm test` runs Prettier checks, ESLint, TypeScript checking, and Jest.
- `pnpm jest:watch` runs the Jest suite interactively.
- `pnpm build` downloads hymn data, regenerates indexes and precache paths,
  then creates a production build. Use `pnpm build:only` when data is already
  prepared.
- `pnpm start` serves the production build; `pnpm storybook` runs Storybook on
  port 7001.
- `pnpm hymns <command>` runs the hymn-maintenance CLI described in `README.md`.

## Coding Style & Naming Conventions

Write strict TypeScript and React components using the existing feature-folder
layout. Follow the repository's Mantine ESLint configuration and Prettier
settings; run `pnpm prettier:write` for formatting. Use PascalCase for React
components, camelCase for functions and variables, and descriptive names for
hooks beginning with `use`. Keep API routes trailing-slash compatible with the
`trailingSlash` setting.

## Testing Guidelines

Jest with React Testing Library is the test stack. Name tests `*.test.ts` or
`*.test.tsx` and place them beside the implementation. Add regression coverage
for behavior changes and run `pnpm test` before submitting changes. No explicit
coverage threshold is configured.

## Commit & Pull Request Guidelines

Recent commits use concise Conventional Commit-style subjects, often with
Gitmoji, such as `feat(...)` and `refactor(...)`. Keep commits focused and
describe the user-visible or technical change. Pull requests should explain
the motivation and implementation, list validation commands, link related
issues when applicable, and include screenshots or recordings for UI changes.

## Security & Configuration

Copy `.env.example` to a local environment file and never commit credentials
or `.env.local`. Review generated data and index changes separately from code
changes, since build preparation can regenerate them.
