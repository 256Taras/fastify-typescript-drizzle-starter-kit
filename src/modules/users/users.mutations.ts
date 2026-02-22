import type { UUID } from "node:crypto";

import type { Cradle } from "@fastify/awilix";
import { partial } from "rambda";

import type { User, UserCreateInput, UserUpdateInput } from "./users.contracts.ts";
import { isEmailTakenByOtherUser } from "./users.domain.ts";
import { USER_EVENTS } from "./users.events.ts";

import { ConflictException, ResourceNotFoundException } from "#libs/errors/domain.errors.ts";

const createOneUser = async (
  { usersRepository, encrypterService, eventBus, logger }: Cradle,
  input: UserCreateInput,
): Promise<User> => {
  logger.debug(`[UsersMutations] Creating user: ${input.email}`);

  const existingUser = await usersRepository.findOneByEmail(input.email);
  if (existingUser) {
    throw new ConflictException(`User with email: ${input.email} already exists`);
  }

  const hashedPassword = await encrypterService.getHash(input.password);
  const newUser = await usersRepository.createOne({
    ...input,
    password: hashedPassword,
  });

  await eventBus.emit(USER_EVENTS.CREATED, { userId: newUser.id });

  logger.info(`[UsersMutations] User created: ${newUser.id}`);

  return newUser;
};

const updateOneUser = async (
  { usersRepository, eventBus, logger }: Cradle,
  userId: UUID,
  input: UserUpdateInput,
): Promise<User> => {
  logger.debug(`[UsersMutations] Updating user: ${userId}`);

  if (input.email) {
    const existingUser = await usersRepository.findOneByEmail(input.email);
    if (isEmailTakenByOtherUser(existingUser, userId)) {
      throw new ConflictException(`User with email: ${input.email} already exists`);
    }
  }

  const updatedUser = await usersRepository.updateOneById(userId, input);
  if (!updatedUser) throw new ResourceNotFoundException(`User with id: ${userId} not found`);

  await eventBus.emit(USER_EVENTS.UPDATED, { userId: updatedUser.id });

  logger.info(`[UsersMutations] User updated: ${updatedUser.id}`);
  return updatedUser;
};

const deleteOneUser = async ({ usersRepository, eventBus, logger }: Cradle, userId: UUID): Promise<User> => {
  logger.debug(`[UsersMutations] Deleting user: ${userId}`);

  const deletedUser = await usersRepository.softDeleteOneById(userId);
  if (!deletedUser) throw new ResourceNotFoundException(`User with id: ${userId} not found`);

  await eventBus.emit(USER_EVENTS.DELETED, { userId: deletedUser.id });

  logger.info(`[UsersMutations] User deleted: ${deletedUser.id}`);
  return deletedUser;
};

export default function usersMutations(deps: Cradle) {
  return {
    createOne: partial(createOneUser, [deps]),
    deleteOne: partial(deleteOneUser, [deps]),
    updateOne: partial(updateOneUser, [deps]),
  };
}
