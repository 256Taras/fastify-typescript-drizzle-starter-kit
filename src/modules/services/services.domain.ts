import type { UUID } from "node:crypto";

import type { Service } from "./services.types.d.ts";

import type { Provider } from "#modules/providers/providers.types.d.ts";

export const canUserEditService = (service: Service, provider: Provider, userId: UUID): boolean => {
  return service.providerId === provider.id && provider.userId === userId;
};
