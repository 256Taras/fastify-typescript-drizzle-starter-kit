import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";

import servicesSchemas from "./services.schemas.ts";

const servicesRouterV1: FastifyPluginAsyncTypebox = async (app) => {
  const { servicesMutations, servicesQueries } = app.diContainer.cradle;

  app.get("/", {
    schema: servicesSchemas.getMany,
    handler: (req) => servicesQueries.findMany(app.transformers.getPaginationQuery(req)),
  });

  app.get("/:id", {
    schema: servicesSchemas.getOne,
    handler: (req) => servicesQueries.findOneById(req.params.id),
  });

  app.post("/provider/:providerId", {
    preHandler: app.auth([app.verifyJwt]),
    schema: servicesSchemas.createOne,
    handler: async (req, rep) => {
      rep.status(201);
      return servicesMutations.createOne(req.params.providerId, req.body);
    },
  });

  app.patch("/:id", {
    preHandler: app.auth([app.verifyJwt]),
    schema: servicesSchemas.updateOne,
    handler: (req) => servicesMutations.updateOne(req.params.id, req.body),
  });

  app.delete("/:id", {
    preHandler: app.auth([app.verifyJwt]),
    schema: servicesSchemas.deleteOne,
    handler: (req) => servicesMutations.deleteOne(req.params.id),
  });
};

export default servicesRouterV1;
