# SquidCRM

## Project Structure

The project is organized into the following directories:

  - `apps/`: Contains the main applications.
  - `apps/api/`: The backend API application.
  - `apps/web/`: The frontend web application.
  - `packages/`: Contains shared packages and configurations.
  - `packages/database/`: Database-related configurations and scripts.
  - `packages/eslint-config/`: Custom ESLint configurations.
  - `packages/typescript-config/`: Shared TypeScript configurations.

## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/)

### Installation

Install the dependencies for the entire monorepo:

```sh
pnpm install
```

### Development

To start the development servers for all applications:

```sh
pnpm dev
```

### Building

To build all applications and packages:

```sh
pnpm build
```

### Linting

To run the linter:

```sh
pnpm lint
```

## Project Details

### API

The API application is located in the `apps/api/` directory. It includes various schemas and controllers for managing users and contacts.

### Web

The web application is located in the `apps/web/` directory. It is built using Svelte and includes configurations for Tailwind CSS and Vite.

## Additional Tools

This project includes additional tools for development:

- [TypeScript](https://www.typescriptlang.org/) for static type checking.
- [ESLint](https://eslint.org/) for code linting.
- [Prettier](https://prettier.io) for code formatting.

## Useful Links

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Svelte Documentation](https://svelte.dev/docs)
- [Vite Documentation](https://vitejs.dev/guide/)