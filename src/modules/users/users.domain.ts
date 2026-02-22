import type { UUID } from "node:crypto";

import type { User } from "./users.contracts.ts";

export const isEmailTakenByOtherUser = (existingUser: undefined | User, currentUserId: UUID): boolean => {
  return existingUser !== undefined && existingUser.id !== currentUserId;
};
