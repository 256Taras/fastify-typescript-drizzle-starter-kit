# Project Structure

## Overview

```text
.
├── configs/              # Environment files (.env, .env.test)
├── docs/                 # Documentation
├── infra/                # Docker, database migrations, CI/CD
├── scripts/              # Build and utility scripts
├── src/                  # Application source code
└── tests/                # Automated tests
```

## Source Code (`src/`)

```text
src/
├── index.ts              # Application entry point
├── configs/              # Configuration modules
├── infra/                # Infrastructure layer
├── libs/                 # Shared utilities
├── modules/              # Business modules
└── types/                # Global type definitions
```

### `configs/`

Environment-based configuration with TypeBox validation.

| File | Description |
|------|-------------|
| `env.config.ts` | Environment schema and validation |
| `app.config.ts` | Application settings |
| `db.config.ts` | Database connection |
| `server.config.ts` | HTTP server settings |
| `logger.config.ts` | Pino logger settings |
| `fastify-*.config.ts` | Fastify plugin configs |

### `infra/`

Infrastructure layer - HTTP server and database.

```text
infra/
├── api/http/
│   ├── fastify-server.ts        # HTTP server class
│   ├── fastify-error-handler.ts # Global error handling
│   └── routes/
│       └── health-check.router.ts
└── database/
    ├── db.ts                    # Database connection
    ├── db-schema.ts             # Schema registry
    └── table-names.ts           # Table name constants
```

### `libs/`

Shared utilities and cross-cutting concerns.

| Directory | Description |
|-----------|-------------|
| `auth/` | JWT authentication plugin |
| `di-container/` | Awilix dependency injection |
| `email/` | Email service with templates |
| `encryption/` | Crypto utilities |
| `errors/` | Domain error classes |
| `events/` | Event bus (EventEmitter) |
| `logging/` | Pino logger plugin |
| `pagination/` | Cursor/offset pagination |
| `persistence/` | Unit of Work, transactions |
| `session-storage/` | Request-scoped storage |
| `constants/` | Shared constants |
| `contracts/` | Shared TypeBox contracts |
| `utils/` | Utility functions |

### `modules/`

Business modules. Each module is self-contained.

```text
modules/
├── auth/        # Authentication (login, register, tokens)
├── users/       # User management
├── providers/   # Service providers
├── services/    # Services catalog
├── bookings/    # Booking management
├── payments/    # Payment processing
├── reviews/     # Reviews and ratings
└── audits/      # Audit logging
```

#### Module File Structure

Each module follows a consistent pattern:

| File | Purpose |
|------|---------|
| `*.model.ts` | Drizzle schema (tables, columns) |
| `*.contracts.ts` | TypeBox type definitions |
| `*.schemas.ts` | Fastify route schemas |
| `*.router.v1.ts` | HTTP endpoints |
| `*.queries.ts` | Read operations (CQS Query) |
| `*.mutations.ts` | Write operations (CQS Command) |
| `*.repository.ts` | Data access layer |
| `*.events.ts` | Domain event constants |
| `*.event-handlers.ts` | Event subscribers |
| `*.pagination-config.ts` | Pagination settings |
| `*.types.d.ts` | Module type definitions |

### `types/`

Global TypeScript definitions.

| File | Description |
|------|-------------|
| `index.d.ts` | Re-exports |
| `config.types.d.ts` | Config types |
| `fastify-augmentation.d.ts` | Fastify type extensions |

## Tests (`tests/`)

```text
tests/
├── unit/           # Unit tests (mocked dependencies)
├── integration/    # Integration tests (with database)
├── e2e/            # End-to-end API tests
└── helpers/        # Test utilities
```

## Infrastructure (`infra/`)

```text
infra/
├── database/
│   └── drizzle.config.js    # Drizzle ORM config
└── docker/
    ├── docker-compose.yml        # Base compose
    ├── docker-compose.dev.yml    # Development
    ├── docker-compose.test.yml   # Test environment
    └── docker-compose.monitoring.yml  # Prometheus, Grafana
```

## Scripts (`scripts/`)

```text
scripts/
├── database/
│   └── seed.script.js    # Database seeding
└── env/
    └── validate-env.ts   # Environment validation
```
