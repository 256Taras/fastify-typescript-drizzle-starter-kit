# VSCode Snippets

Code snippets for faster development. Work in `.ts` files.

## Usage

1. Open any `.ts` file
2. Type snippet prefix (e.g. `froute`)
3. Press `Tab` or `Enter`
4. Fill placeholders (press `Tab` to jump between them)

## Available Snippets

| Prefix | Description |
|--------|-------------|
| `froute` | Single route handler |
| `frouter` | Full router with CRUD |
| `repomod` | Repository module |
| `repofn` | Repository function |
| `queriesmod` | Queries module |
| `mutationsmod` | Mutations module |
| `mutationfn` | Mutation function |
| `domainguard` | Domain guard function |
| `domainhelper` | Domain helper function |
| `tschema` | TypeBox schema |
| `tcontract` | Contracts from Drizzle |
| `typesdecl` | Types declaration file |
| `events` | Event constants |
| `eventhandler` | Event handler module |
| `eemit` | Emit event |
| `ethrow` | Throw domain error |
| `dselect` | Drizzle select |
| `dupdate` | Drizzle update |
| `partialfn` | Partial function export |

## Examples

### `froute` - Route handler

```
Type: froute
```

```typescript
app.get("/path", {
  schema: schemas.method,
  async handler(req, rep) {

  },
});
```

### `frouter` - Full router

```
Type: frouter → Tab → bookings
```

```typescript
import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";

import bookingsSchemas from "./bookings.schemas.ts";

const bookingsRouterV1: FastifyPluginAsyncTypebox = async (app) => {
  const { bookingsMutations, bookingsQueries } = app.diContainer.cradle;

  app.addHook("preHandler", app.auth([app.verifyJwt]));

  app.get("/", {
    schema: bookingsSchemas.getMany,
    async handler(req) {
      return bookingsQueries.findMany(app.transformers.getPaginationQuery(req));
    },
  });
  // ... more routes
};

export default bookingsRouterV1;
```

### `domainguard` - Guard function

```
Type: domainguard → Tab → Cancel → Tab → Booking
```

```typescript
export const canCancelBooking = (
  booking: Booking,
  userId: string,
): boolean => {
  return booking.userId === userId;
};
```

### `mutationfn` - Mutation function

```
Type: mutationfn → Tab → deleteOne → Tab → bookings → Tab → id → Tab → Booking
```

```typescript
const deleteOne = async (
  { bookingsRepository, eventBus, logger, sessionStorageService }: Cradle,
  id: UUID,
): Promise<Booking> => {
  const { userId } = sessionStorageService.getUser();

  logger.debug("[BookingMutations] deleteOne: " + id);

  const entity = await bookingsRepository.findOneById(id);
  if (!entity) {
    throw new ResourceNotFoundException("Booking with id: " + id + " not found");
  }

  // TODO: add business logic

  return entity;
};
```

### `ethrow` - Throw error

```
Type: ethrow → select ResourceNotFoundException → Tab → User not found
```

```typescript
throw new ResourceNotFoundException("User not found");
```

### `eemit` - Emit event

```
Type: eemit → Tab → BOOKING → Tab → CREATED → Tab → booking → Tab → data
```

```typescript
await eventBus.emit(BOOKING_EVENTS.CREATED, { booking: data });
```

### `dselect` - Drizzle select

```
Type: dselect
```

```typescript
const [result] = await db
  .select(columns)
  .from(table)
  .where(eq(table.field, value));

return result ?? null;
```
