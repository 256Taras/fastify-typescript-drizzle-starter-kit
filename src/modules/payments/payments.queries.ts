import type { UUID } from "node:crypto";

import type { Cradle } from "@fastify/awilix";
import { partial } from "rambda";

import type { Payment } from "./payments.types.d.ts";

import { ResourceNotFoundException } from "#libs/errors/domain.errors.ts";

const findOneById = async (
  { paymentsRepository, sessionStorageService, logger }: Cradle,
  paymentId: UUID,
): Promise<Payment> => {
  const { userId } = sessionStorageService.getUser();

  logger.debug(`[PaymentsQueries] Getting payment: ${paymentId}`);

  const payment = await paymentsRepository.findOneByIdForUser(paymentId, userId);
  if (!payment) {
    throw new ResourceNotFoundException(`Payment with id: ${paymentId} not found`);
  }

  return payment;
};

const findOneByBookingId = async ({ paymentsRepository, logger }: Cradle, bookingId: UUID): Promise<Payment | undefined> => {
  logger.debug(`[PaymentsQueries] Getting payment for booking: ${bookingId}`);

  return paymentsRepository.findOneByBookingId(bookingId);
};

export default function paymentsQueries(deps: Cradle) {
  return {
    findOneById: partial(findOneById, [deps]),
    findOneByBookingId: partial(findOneByBookingId, [deps]),
  };
}
