import type { UUID } from "node:crypto";

import { requestContext } from "@fastify/request-context";

import { TOKENS } from "#libs/constants/common.constants.ts";
import { UnauthorizedException } from "#libs/errors/domain.errors.ts";

type UserCredentials = {
  ppid: string;
  refreshTokenId: UUID;
  userId: UUID;
};

type UserJwtData = {
  refreshTokenId: UUID;
  userId: UUID;
};

const getUser = (): UserJwtData => {
  const user = requestContext.get(TOKENS.userJwtData);
  if (!user) throw new UnauthorizedException("User not found in session");
  return user;
};

const setUser = (data: UserJwtData): void => {
  requestContext.set(TOKENS.userJwtData, data);
};

const getUserCredentials = (): undefined | UserCredentials => {
  return requestContext.get(TOKENS.userCredentials);
};

const setUserCredentials = (credentials: UserCredentials): void => {
  requestContext.set(TOKENS.userCredentials, credentials);
};

/**
 * Creates a session storage service to manage user data and credentials.
 */
const sessionStorageService = () => ({
  getUser,
  getUserCredentials,
  setUser,
  setUserCredentials,
});

export default sessionStorageService;
