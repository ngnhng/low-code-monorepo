# Project Name Here

## Getting Started

1. Clone this repository
2. Make sure Node.js version 18.16 or higher is installed (you can use [nvm](github.com/nvm-sh/nvm) to manage Node.js versions)
3. Run `npm i` to install dependencies
4. Run `npm run dev` to start the development server
5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result

## Development

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.

### Branching

-   `main`: The main branch. This branch is protected and cannot be pushed to directly.
-   `dev`: The development branch, where all new features are merged into.
-   `feature/<feature-name>`: A feature branch. This branch is branched off of `dev` and merged back into `dev` when the feature is complete.
-   `fix/<fix-name>`: A fix branch. This branch is branched off of `dev` and merged back into `dev` when the fix is complete.

### Common commands

#### Install dependencies

##### For all packages

```sh
npm i
```

##### For a workspace

```sh
npm i <package-name> --workspace=<package-name>
```

Run the following command:

```sh
npx create-turbo@latest
```

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

-   `docs`: a [Next.js](https://nextjs.org/) app
-   `web`: another [Next.js](https://nextjs.org/) app
-   `@repo/ui`: a stub React component library shared by both `web` and `docs` applications
-   `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
-   `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

-   [TypeScript](https://www.typescriptlang.org/) for static type checking
-   [ESLint](https://eslint.org/) for code linting
-   [Prettier](https://prettier.io) for code formatting

### Remote Caching

Turborepo can use a technique known as [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup), then enter the following commands:

```
cd my-turborepo
npx turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
npx turbo link
```

## Useful Links

Learn more about the power of Turborepo:

-   [Tasks](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
-   [Caching](https://turbo.build/repo/docs/core-concepts/caching)
-   [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
-   [Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
-   [Configuration Options](https://turbo.build/repo/docs/reference/configuration)
-   [CLI Usage](https://turbo.build/repo/docs/reference/command-line-reference)
