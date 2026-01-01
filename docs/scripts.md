# Project Scripts

Available npm scripts for development, testing, and operations.

## Running the Application

| Script | Command | Description |
|--------|---------|-------------|
| `start` | `node src/index.ts` | Start production server |
| `dev` | `node --watch src/index.ts \| pino-pretty` | Start dev server with watch + pretty logs |

## Docker

| Script | Description |
|--------|-------------|
| `dc:infra` | Start PostgreSQL only |
| `dc:infra:down` | Stop PostgreSQL |
| `dc:dev` | Start full dev environment |
| `dc:dev:down` | Stop dev environment |
| `dc:monitoring` | Start monitoring stack (Prometheus, Grafana, Loki) |
| `dc:monitoring:down` | Stop monitoring stack |

## Database (Drizzle ORM)

| Script | Description |
|--------|-------------|
| `db:generate` | Generate migrations from schema |
| `db:push` | Push schema changes to database |
| `db:push:test` | Push schema to test database (force) |
| `db:migrate` | Run pending migrations |
| `db:seed` | Seed database |
| `db:seed:dev` | Seed development data |
| `db:seed:test` | Seed test data |
| `db:reset` | Drop + push + migrate + seed (full reset) |
| `db:studio` | Open Drizzle Studio (port 3000) |
| `db:check` | Check migration consistency |
| `db:drop` | Drop all migrations |
| `db:up` | Update Drizzle metadata |
| `db:introspect` | Generate schema from existing database |

## Code Quality

| Script | Description |
|--------|-------------|
| `lint` | Run ESLint |
| `lint:fix` | Fix ESLint errors |
| `prettier:fix` | Format code with Prettier |
| `check:types` | TypeScript type check |
| `check:types:watch` | TypeScript type check (watch mode) |
| `check:env` | Validate environment variables |
| `check:dep` | Check for unused/missing dependencies |
| `deps:validate` | Validate dependency graph |
| `check` | Run types + lint |

## Testing

| Script | Description |
|--------|-------------|
| `test` | Run all tests with coverage (c8) |
| `test:unit` | Run unit tests only |
| `test:integration` | Run integration tests only |
| `test:e2e` | Run e2e tests only |

## Git Hooks

| Script | Description |
|--------|-------------|
| `prepare` | Install Husky hooks |
| `precommit` | Run lint-staged before commit |
| `prepush` | Run lint before push |
| `git:amend` | Stage all + amend last commit |

## Other

| Script | Description |
|--------|-------------|
| `generate` | Scaffold new module (plop) |
