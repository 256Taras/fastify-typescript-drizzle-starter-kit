import type { Cradle } from "@fastify/awilix";
import { partial } from "rambda";

import type {
  ChangePasswordInput,
  Credentials,
  ForgotPasswordInput,
  ForgotPasswordOutput,
  ResetPasswordInput,
  SignInInput,
  SignUpInput,
} from "./auth.contracts.ts";
import { buildForgotPasswordResponse, isResetTokenValid } from "./auth.domain.ts";
import { AUTH_EVENTS } from "./auth.events.ts";

import { APP_CONFIG } from "#configs/index.ts";
import { STATUS_SUCCESS } from "#libs/constants/common.constants.ts";
import {
  BadRequestException,
  ConflictException,
  ResourceNotFoundException,
  UnauthorizedException,
} from "#libs/errors/domain.errors.ts";

const signUpUser = async (
  { authTokenService, encrypterService, eventBus, logger, unitOfWork, usersRepository }: Cradle,
  input: SignUpInput,
): Promise<Credentials> => {
  logger.debug(`[AuthMutations] Sign up user with email: ${input.email}`);

  const existingUser = await usersRepository.findOneByEmail(input.email);
  if (existingUser) {
    throw new ConflictException(`User with email: ${input.email} already registered`);
  }

  const hashedPassword = await encrypterService.getHash(input.password);

  const { credentials, newUser } = await unitOfWork.run(async () => {
    const newUser = await usersRepository.createOne({
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      password: hashedPassword,
    });

    const credentials = await authTokenService.generateTokens(newUser);
    return { credentials, newUser };
  });

  await eventBus.emit(AUTH_EVENTS.SIGNED_UP, { user: newUser });

  logger.info(`[AuthMutations] User signed up: ${newUser.id}`);

  return credentials;
};

const signInUser = async (
  { authTokenService, encrypterService, eventBus, logger, usersRepository }: Cradle,
  input: SignInInput,
): Promise<Credentials> => {
  logger.debug(`[AuthMutations] Sign in attempt for email: ${input.email}`);

  const user = await usersRepository.findOneByEmailWithPassword(input.email);

  if (!user) {
    throw new ResourceNotFoundException(`User with email: ${input.email} not found`);
  }

  const isPasswordValid = await encrypterService.compareHash(input.password, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedException("Invalid password");
  }

  const { password: _password, ...userWithoutPassword } = user;

  await eventBus.emit(AUTH_EVENTS.SIGNED_IN, { user: userWithoutPassword });

  logger.info(`[AuthMutations] User signed in: ${user.id}`);

  return authTokenService.generateTokens(userWithoutPassword);
};

const signOutUser = async ({
  authTokenRepository,
  eventBus,
  logger,
  sessionStorageService,
}: Cradle): Promise<typeof STATUS_SUCCESS> => {
  const credentials = sessionStorageService.getUserCredentials();
  if (!credentials) {
    throw new UnauthorizedException("User credentials not found in session");
  }
  const { ppid, userId } = credentials;

  logger.debug(`[AuthMutations] Signing out user: ${userId}`);

  const result = await authTokenRepository.deleteMany(ppid, userId);

  if (result.length === 0) {
    throw new UnauthorizedException("Failed to sign out");
  }

  await eventBus.emit(AUTH_EVENTS.SIGNED_OUT, { userId });

  logger.info(`[AuthMutations] User signed out: ${userId}`);

  return STATUS_SUCCESS;
};

const refreshUserTokens = async ({
  authTokenRepository,
  authTokenService,
  logger,
  sessionStorageService,
  usersRepository,
}: Cradle): Promise<Credentials> => {
  const credentials = sessionStorageService.getUserCredentials();
  if (!credentials) {
    throw new UnauthorizedException("User credentials not found in session");
  }
  const { ppid, userId } = credentials;

  logger.debug(`[AuthMutations] Refreshing tokens for user: ${userId}`);

  const user = await usersRepository.findOneById(userId);

  if (!user) {
    throw new ResourceNotFoundException("User not found");
  }

  const result = await authTokenRepository.deleteMany(ppid, userId);

  if (result.length === 0) {
    throw new UnauthorizedException("Failed to refresh tokens");
  }

  logger.info(`[AuthMutations] Tokens refreshed for user: ${userId}`);

  return authTokenService.generateTokens(user);
};

const forgotUserPassword = async (
  {
    authPasswordResetTokenRepository,
    configs,
    dateTimeService,
    emailService,
    encrypterService,
    logger,
    usersRepository,
  }: Cradle,
  input: ForgotPasswordInput,
): Promise<ForgotPasswordOutput> => {
  logger.debug(`[AuthMutations] Password reset requested for email: ${input.email}`);

  const user = await usersRepository.findOneByEmail(input.email);

  if (!user) {
    logger.debug(`[AuthMutations] User with email ${input.email} not found, but returning success`);
    return STATUS_SUCCESS;
  }

  const resetToken = encrypterService.randomBytes(32);
  const expiresAt = dateTimeService.toDate(dateTimeService.addHours(dateTimeService.now(), 1));

  await authPasswordResetTokenRepository.createOne({
    email: input.email,
    expiresAt,
    token: resetToken,
  });

  const resetUrl = `${APP_CONFIG.applicationUrl}/auth/reset-password?token=${resetToken}`;
  emailService.sendPasswordResetEmail({ email: input.email, resetToken, resetUrl });

  logger.info(`[AuthMutations] Password reset email sent to: ${input.email}`);

  return buildForgotPasswordResponse(configs.APP_CONFIG.isTest, resetToken);
};

const resetUserPassword = async (
  { authPasswordResetTokenRepository, dateTimeService, encrypterService, logger, usersRepository }: Cradle,
  input: ResetPasswordInput,
): Promise<typeof STATUS_SUCCESS> => {
  logger.debug(`[AuthMutations] Attempting password reset with token`);

  const resetTokenRecord = await authPasswordResetTokenRepository.findOne(input.token);

  if (!resetTokenRecord) {
    throw new UnauthorizedException("Invalid or already used reset token");
  }

  if (!isResetTokenValid(resetTokenRecord, dateTimeService.nowDate())) {
    throw new UnauthorizedException("Reset token has expired");
  }

  const user = await usersRepository.findOneByEmail(resetTokenRecord.email);

  if (!user) {
    throw new ResourceNotFoundException("User not found");
  }

  const hashedPassword = await encrypterService.getHash(input.password);

  await usersRepository.updateOnePasswordById(user.id, hashedPassword);
  await authPasswordResetTokenRepository.updateOneAsUsed(resetTokenRecord.id);

  logger.info(`[AuthMutations] Password successfully reset for user: ${user.email}`);

  return STATUS_SUCCESS;
};

const changeUserPassword = async (
  { emailService, encrypterService, eventBus, logger, sessionStorageService, usersRepository }: Cradle,
  input: ChangePasswordInput,
): Promise<typeof STATUS_SUCCESS> => {
  const { userId } = sessionStorageService.getUser();

  logger.debug(`[AuthMutations] Password change requested for user: ${userId}`);

  const user = await usersRepository.findOneByIdWithPassword(userId);

  if (!user) {
    throw new ResourceNotFoundException("User not found");
  }

  const isOldPasswordValid = await encrypterService.compareHash(input.oldPassword, user.password);

  if (!isOldPasswordValid) {
    throw new UnauthorizedException("Current password is incorrect");
  }

  const isSamePassword = await encrypterService.compareHash(input.newPassword, user.password);

  if (isSamePassword) {
    throw new BadRequestException("New password must be different from current password");
  }

  const hashedPassword = await encrypterService.getHash(input.newPassword);

  await usersRepository.updateOnePasswordById(userId, hashedPassword);
  emailService.sendPasswordChangedEmail({ email: user.email });

  const { password: _password, ...userWithoutPassword } = user;
  await eventBus.emit(AUTH_EVENTS.PASSWORD_CHANGED, { user: userWithoutPassword });

  logger.info(`[AuthMutations] Password successfully changed for user: ${userId}`);

  return STATUS_SUCCESS;
};

export default function authMutations(deps: Cradle) {
  return {
    changePassword: partial(changeUserPassword, [deps]),
    forgotPassword: partial(forgotUserPassword, [deps]),
    refreshTokens: () => refreshUserTokens(deps),
    resetPassword: partial(resetUserPassword, [deps]),
    signIn: partial(signInUser, [deps]),
    signOut: () => signOutUser(deps),
    signUp: partial(signUpUser, [deps]),
  };
}
