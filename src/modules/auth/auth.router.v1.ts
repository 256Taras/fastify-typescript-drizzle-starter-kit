import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";

import authSchemas from "./auth.schemas.ts";

import { AUTH_RATE_LIMITS } from "#libs/constants/rate-limits.constants.ts";

const authRouterV1: FastifyPluginAsyncTypebox = async (app) => {
  const { authMutations } = app.diContainer.cradle;

  app.post("/sign-up", {
    schema: authSchemas.signUp,

    handler(req) {
      return authMutations.signUp(req.body);
    },
  });

  app.post("/sign-in", {
    schema: authSchemas.signIn,
    config: {
      rateLimit: AUTH_RATE_LIMITS.signIn,
    },

    handler(req) {
      return authMutations.signIn(req.body);
    },
  });

  app.post("/log-out", {
    schema: authSchemas.logOut,
    preValidation: [app.auth([app.verifyJwtRefreshToken])],

    async handler() {
      return authMutations.signOut();
    },
  });

  app.put("/refresh-tokens", {
    schema: authSchemas.refreshTokens,
    preValidation: [app.auth([app.verifyJwtRefreshToken])],

    async handler() {
      return authMutations.refreshTokens();
    },
  });

  app.post("/forgot-password", {
    schema: authSchemas.forgotPassword,
    config: {
      rateLimit: AUTH_RATE_LIMITS.forgotPassword,
    },

    handler(req) {
      return authMutations.forgotPassword(req.body);
    },
  });

  app.post("/reset-password", {
    schema: authSchemas.resetPassword,

    handler(req) {
      return authMutations.resetPassword(req.body);
    },
  });

  app.post("/change-password", {
    schema: authSchemas.changePassword,
    preValidation: [app.auth([app.verifyJwt])],

    handler(req) {
      return authMutations.changePassword(req.body);
    },
  });
};

export default authRouterV1;
