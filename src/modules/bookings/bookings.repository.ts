import type { UUID } from "node:crypto";

import type { Cradle } from "@fastify/awilix";
import { and, eq, gt, type InferInsertModel, lt, notInArray } from "drizzle-orm";
import { partial } from "rambda";

import type { Booking, BookingInsert } from "./bookings.types.d.ts";

import { createBaseRepository } from "#libs/persistence/base-repository.ts";
import { BOOKING_STATUS } from "#modules/bookings/bookings.constants.ts";
import { BOOKING_PUBLIC_COLUMNS, bookings } from "#modules/bookings/bookings.model.ts";
import { PROVIDER_PUBLIC_COLUMNS, providers } from "#modules/providers/providers.model.ts";
import type { Provider } from "#modules/providers/providers.types.ts";
import { SERVICE_PUBLIC_COLUMNS, services } from "#modules/services/services.model.ts";
import type { Service } from "#modules/services/services.types.ts";
import type { DateTimeString } from "#types/brands.ts";

type BookingInsertDrizzle = InferInsertModel<typeof bookings>;

const findManyByServiceIdAndTimeRange = async (
  { db }: Cradle,
  serviceId: UUID,
  startAt: DateTimeString,
  endAt: DateTimeString,
): Promise<Array<{ endAt: DateTimeString; startAt: DateTimeString }>> => {
  const result = await db
    .select({ startAt: bookings.startAt, endAt: bookings.endAt })
    .from(bookings)
    .where(
      and(
        eq(bookings.serviceId, serviceId),
        lt(bookings.startAt, endAt),
        gt(bookings.endAt, startAt),
        notInArray(bookings.status, [BOOKING_STATUS.cancelled]),
      ),
    );

  return result;
};

const findOneByIdWithContext = async (
  { db }: Cradle,
  id: UUID,
): Promise<{
  booking: Booking;
  provider: Provider;
  service: Service;
} | null> => {
  const [result] = await db
    .select({
      booking: BOOKING_PUBLIC_COLUMNS,
      provider: PROVIDER_PUBLIC_COLUMNS,
      service: SERVICE_PUBLIC_COLUMNS,
    })
    .from(bookings)
    .innerJoin(services, eq(bookings.serviceId, services.id))
    .innerJoin(providers, eq(services.providerId, providers.id))
    .where(eq(bookings.id, id));

  return result ?? null;
};

const updateOneById = async (
  { db, dateTimeService }: Cradle,
  id: UUID,
  data: Partial<Omit<BookingInsertDrizzle, "createdAt" | "id" | "updatedAt">>,
): Promise<Booking | null> => {
  const [updated] = await db
    .update(bookings)
    .set({ ...data, updatedAt: dateTimeService.now() })
    .where(eq(bookings.id, id))
    .returning(BOOKING_PUBLIC_COLUMNS);

  return updated;
};

export default function bookingsRepository(deps: Cradle) {
  const baseRepo = createBaseRepository<typeof bookings, Booking, BookingInsert>({
    table: bookings,
    logger: deps.logger,
    db: deps.db,
    defaultSelectColumns: BOOKING_PUBLIC_COLUMNS,
  });

  return {
    createOne: baseRepo.createOne,
    findOneById: baseRepo.findOneById,
    findOneByIdWithContext: partial(findOneByIdWithContext, [deps]),
    findManyByServiceIdAndTimeRange: partial(findManyByServiceIdAndTimeRange, [deps]),
    updateOneById: partial(updateOneById, [deps]),
  };
}
