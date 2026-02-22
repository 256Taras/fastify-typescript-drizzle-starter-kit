import type { ForgotPasswordOutput } from "./auth.contracts.ts";

import { STATUS_SUCCESS } from "#libs/constants/common.constants.ts";

export const isResetTokenValid = (token: { expiresAt: Date } | undefined, currentDate: Date): boolean => {
  if (!token) {
    return false;
  }

  return currentDate < token.expiresAt;
};

export const buildForgotPasswordResponse = (isTestMode: boolean, resetToken: string): ForgotPasswordOutput => {
  if (isTestMode) {
    return { status: true, resetToken };
  }

  return STATUS_SUCCESS;
};
