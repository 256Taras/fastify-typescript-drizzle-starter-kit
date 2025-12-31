# Environment Variables

## Quick Start

```bash
cp configs/.env.example configs/.env
```

## Variables

### Application

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `APPLICATION_NAME` | string | yes | `starter-kit` | Application name |
| `APPLICATION_URL` | string | yes | `http://localhost:8000` | Base URL |
| `ENV_NAME` | string | yes | `development` | Environment: `development`, `test`, `production` |
| `VERSION` | string | no | `latest` | Application version |
| `IP` | string | yes | `0.0.0.0` | `127.0.0.1` - local only, `0.0.0.0` - external access |
| `HTTP_PORT` | integer | yes | `8000` | HTTP port |
| `SHUTDOWN_TIMEOUT` | integer | yes | `3000` | Graceful shutdown timeout (ms) |
| `REQUEST_TIMEOUT` | integer | yes | `6000` | Request timeout (ms) |

### Database

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `DATABASE_URL` | string | yes | PostgreSQL connection string |
| `DATABASE_TIMEOUT` | integer | yes | Database query timeout (ms) |
| `ENABLE_SEEDS` | 0/1 | yes | Enable database seeding |

### Security

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `JWT_ACCESS_TOKEN_SECRET` | string (32+) | yes | JWT access token secret |
| `JWT_ACCESS_TOKEN_EXPIRATION_TIME` | string | yes | Access token TTL (e.g., `15m`) |
| `JWT_REFRESH_TOKEN_SECRET` | string (32+) | yes | JWT refresh token secret |
| `JWT_REFRESH_TOKEN_EXPIRATION_TIME` | string | yes | Refresh token TTL (e.g., `30d`) |
| `ENCRYPTION_KEY` | string (32+) | yes | Encryption key for sensitive data |

### Logging

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `LOG_LEVEL` | string | yes | `debug` | `trace`, `debug`, `info`, `warn`, `error`, `fatal` |
| `ENABLE_PRETTY_LOG` | 0/1 | yes | `1` | Pretty print logs |
| `ENABLE_COLORIZED_LOG` | 0/1 | yes | `1` | Colorized logs |
| `ENABLE_DB_LOGGING` | 0/1 | yes | `1` | Database query logging |
| `ENABLE_RESPONSE_LOGGING_BODY` | 0/1 | yes | `1` | Log response bodies |
| `ENABLE_DEVELOPER_MESSAGE` | 0/1 | yes | `1` | Developer messages in errors |
| `ENABLE_PERSISTENCE_FORCE_LOGGING` | 0/1 | yes | `1` | Force persistence logging |
| `ENABLE_DEBUG` | 0/1 | yes | `0` | Debug mode |

### Rate Limiting

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `RATE_LIMIT_MAX` | integer | yes | `10` | Max requests per window |
| `RATE_LIMIT_TIME_WINDOW` | integer | yes | `60000` | Time window (ms) |

### Metrics

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `METRICS_API_KEY` | string (16+) | no | API key for `/api/metrics` endpoint |

### CORS

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `ALLOWED_ORIGINS` | string | no | Comma-separated allowed origins |

## Environment Files

```
configs/
├── .env                 # Development (gitignored)
├── .env.example         # Template
├── .env.test            # Test environment
└── .env.production      # Production (gitignored)
```

File selection based on `ENV_NAME`:
- `development` → `configs/.env`
- `test` → `configs/.env.test`
- `production` → `configs/.env.production`
