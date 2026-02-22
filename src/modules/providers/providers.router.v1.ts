import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";

import providersSchemas from "./providers.schemas.ts";

const providersRouterV1: FastifyPluginAsyncTypebox = async (app) => {
  const { providersMutations, providersQueries } = app.diContainer.cradle;

  app.get("/", {
    schema: providersSchemas.getMany,
    handler: (req) => providersQueries.findMany(app.transformers.getPaginationQuery(req)),
  });

  app.get("/:id", {
    schema: providersSchemas.getOne,
    handler: (req) => providersQueries.findOneById(req.params.id),
  });

  app.post("/", {
    preHandler: app.auth([app.verifyJwt]),
    schema: providersSchemas.createOne,
    handler: async (req, rep) => {
      rep.status(201);
      return providersMutations.createOne(req.body);
    },
  });

  app.patch("/:id", {
    preHandler: app.auth([app.verifyJwt]),
    schema: providersSchemas.updateOne,
    handler: (req) => providersMutations.updateOne(req.params.id, req.body),
  });

  app.delete("/:id", {
    preHandler: app.auth([app.verifyJwt]),
    schema: providersSchemas.deleteOne,
    handler: (req) => providersMutations.deleteOne(req.params.id),
  });
};

export default providersRouterV1;
