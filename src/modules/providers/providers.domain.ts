import type { UUID } from "node:crypto";

import type { Provider } from "./providers.types.d.ts";

export const canUserManageProvider = (provider: Provider, userId: UUID): boolean => {
  return provider.userId === userId;
};

export const hasExistingProviderProfile = (existingProvider: Provider | undefined): boolean => {
  return existingProvider !== undefined;
};
