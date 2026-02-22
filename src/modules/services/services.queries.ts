import type { UUID } from "node:crypto";

import type { Cradle } from "@fastify/awilix";
import { and, eq, isNull } from "drizzle-orm";
import { partial } from "rambda";

import { SERVICES_PAGINATION_CONFIG } from "./services.pagination-config.ts";
import type { Service, ServicesListResponse } from "./services.types.d.ts";

import { ResourceNotFoundException } from "#libs/errors/domain.errors.ts";
import type { PaginationParams } from "#libs/pagination/pagination.types.d.ts";
import { SERVICE_PUBLIC_COLUMNS, services } from "#modules/services/services.model.ts";

const findOneById = async ({ db, logger }: Cradle, serviceId: UUID): Promise<Service> => {
  logger.debug(`[ServicesQueries] Getting service: ${serviceId}`);

  const [service] = await db
    .select(SERVICE_PUBLIC_COLUMNS)
    .from(services)
    .where(and(eq(services.id, serviceId), isNull(services.deletedAt), eq(services.status, "active")));

  if (!service) throw new ResourceNotFoundException(`Service with id: ${serviceId} not found`);

  return service as Service;
};

const findMany = async (
  { paginationService, logger }: Cradle,
  paginationParams: PaginationParams<"offset">,
): Promise<ServicesListResponse> => {
  logger.debug("[ServicesQueries] Getting services list");

  return paginationService.paginate<typeof services, ServicesListResponse["data"][number]>(
    SERVICES_PAGINATION_CONFIG,
    paginationParams,
    { queryBuilder: (qb) => qb.where(and(isNull(services.deletedAt), eq(services.status, "active"))!) },
  );
};

const findManyByProviderId = async ({ servicesRepository, logger }: Cradle, providerId: UUID): Promise<Service[]> => {
  logger.debug(`[ServicesQueries] Getting services for provider: ${providerId}`);

  return servicesRepository.findManyByProviderId(providerId);
};

export default function servicesQueries(deps: Cradle) {
  return {
    findOneById: partial(findOneById, [deps]),
    findMany: partial(findMany, [deps]),
    findManyByProviderId: partial(findManyByProviderId, [deps]),
  };
}
