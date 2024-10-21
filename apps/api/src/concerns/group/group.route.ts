import { FastifyInstance } from "fastify";
import { $ref } from "./group.schema";
import { createGroup, getGroups } from "./group.controller";

export async function groupRoutes(app: FastifyInstance) {
  app.get(
    "/",
    {
      preHandler: [app.authenticate],
      config: {
        rateLimit: {
          max: 500,
          timeWindow: 5000,
        },
      },
      schema: {
        response: {
          200: $ref("getGroupResponseSchemaArray"),
        },
      },
    },
    getGroups
  );

  app.post(
    "/",
    {
      preHandler: [app.authenticate],
      config: {
        rateLimit: {
          max: 500,
          timeWindow: 5000,
        },
      },
      schema: {
        body: $ref("createGroupSchema"),
        response: {
          200: $ref("getGroupResponseSchema"),
        },
      },
    },
    createGroup
  );

  app.log.info("Group routes registered");
}
