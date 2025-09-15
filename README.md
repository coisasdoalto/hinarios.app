# hinarios.app

Agregador de hinários para uso pessoal online ou offline.

# Dev

## Next.js API Routes + Hono

This project uses [Hono](https://hono.dev/) to create API routes instead of the default Next.js API routes.

> Remember to add slash at the end of the route when createing a new route, for example: `/api/hymns/`, because `next.config.js` has the `trailingSlash: true` option enabled, all API routes must end with a slash. Including `app.route` calls (`app.route('/hymns/', hymnsApp)`).

To create new routes, create a new file in the `api-handlers` folder and export the Hono app as default, following the example below:

```ts
// api-handlers/example.ts
import { Hono } from 'hono';

const exampleApp = new Hono();

exampleApp.get('/', (c) => {
  return c.json({ message: 'Example' });
});

export { exampleApp };
```

Then, import and use the Hono app in the `pages/api/[[...route]].ts` file:

```ts
// pages/api/[[...route]].ts
import { exampleApp } from 'api-handlers/example';
[...]
app.route('/example', exampleApp);
[...]
```

## hymns CLI

The hymns CLI is a command-line tool for managing hymns and releases in the hinarios.app.

### Installation

The CLI is included in the project as a npm script:

```bash
yarn hymns <command>
```

### Available commands

#### `hymns update <hymn-reference> <message>`: Open VS Code (or EDITOR) to update a hymn and records the change in a release file (`.release_data`).

```bash
# Example
yarn hymns update ma/1 -m "Removido (2x) da última linha"
```

##### Arguments

- `hymn-reference`:
  - Format: `<hymn-book-alias>/<hymn-number>`
  - Example: `hc/1` (hinos e cânticos, hino 1)
  - Supported hymn book aliases:
    - hc: Hinos e cânticos
    - he: Hinos espirituais
    - ccs: Corinhos e cânticos de salvação
    - ma: Músicas Avulsas
- `message`: Description of the update to be included in the release notes

#### `hymns commit-release`: Commit release to Github (open prompt to see changes and confirm push)

```bash
# Example
yarn hymns update ma/1 -m "Removido (2x) da última linha"

info: Release title: 2025-03-05-21-33
info: Release body:
# Ajustes de conteúdo
- [MA 1 (O Senhor é o meu pastor, nada me faltará.)](http://hinarios.app/musicas-avulsas/1-O-Senhor-e-o-meu-pastor-(Salmo-23)): Removido (2x) da última linha

Are you sure you want to commit release 2025-03-05-21-33? (y/n) y
info: Generating release in Github using gh...
info: Release created successfully!
info: Link to release:
https://github.com/coisasdoalto/hinarios.app/releases/tag/2025-03-05-21-33
```

## Mantine Next Template

Get started with Mantine + Next with just a few button clicks.
Click `Use this template` button at the header of repository or [follow this link](https://github.com/mantinedev/mantine-next-template/generate) and
create new repository with `@mantine` packages. Note that you have to be logged in to GitHub to generate template.

### Features

This template comes with several essential features:

- Server side rendering setup for Mantine
- Color scheme is stored in cookie to avoid color scheme mismatch after hydration
- Storybook with color scheme toggle
- Jest with react testing library
- ESLint setup with [eslint-config-mantine](https://github.com/mantinedev/eslint-config-mantine)

### npm scripts

#### Build and dev scripts

- `dev` – start dev server
- `build` – bundle application for production
- `export` – exports static website to `out` folder
- `analyze` – analyzes application bundle with [@next/bundle-analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)

#### Testing scripts

- `typecheck` – checks TypeScript types
- `lint` – runs ESLint
- `prettier:check` – checks files with Prettier
- `jest` – runs jest tests
- `jest:watch` – starts jest watch
- `test` – runs `jest`, `prettier:check`, `lint` and `typecheck` scripts

#### Other scripts

- `storybook` – starts storybook dev server
- `storybook:build` – build production storybook bundle to `storybook-static`
- `prettier:write` – formats all files with Prettier
