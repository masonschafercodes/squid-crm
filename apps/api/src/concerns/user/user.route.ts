import { FastifyInstance } from "fastify";
import {
  createUser,
  getUser,
  loginUser,
  logoutUser,
  requestPasswordReset,
  resetPassword,
} from "./user.controller";
import { $ref } from "./user.schema";

export async function userRoutes(app: FastifyInstance) {
  app.get(
    "/",
    {
      preHandler: [app.authenticate],
      schema: {
        response: {
          200: $ref("getUserResponseSchema"),
        },
      },
    },
    getUser,
  );

  app.post(
    "/register",
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: 1000 * 60 * 15,
        },
      },
      schema: {
        body: $ref("createUserSchema"),
        response: {
          201: $ref("createUserResponseSchema"),
        },
      },
    },
    createUser,
  );

  app.post(
    "/login",
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: 1000 * 60 * 15,
        },
      },
      schema: {
        body: $ref("loginSchema"),
        response: {
          201: $ref("loginResponseSchema"),
        },
      },
    },
    loginUser,
  );

  app.delete(
    "/logout",
    {
      preHandler: [app.authenticate],
      config: {
        rateLimit: {
          max: 5,
          timeWindow: 1000 * 60 * 15,
        },
      },
      schema: {
        response: {
          204: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
        },
      },
    },
    logoutUser,
  );

  app.post(
    "/password-reset",
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: 1000 * 60 * 15,
        },
      },
      schema: {
        body: $ref("createPasswordResetSchema"),
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
        },
      },
    },
    requestPasswordReset,
  );

  app.patch(
    "/password-reset",
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: 1000 * 60 * 15,
        },
      },
      schema: {
        params: {
          type: "object",
          properties: {
            token: { type: "string" },
          },
        },
        body: $ref("resetPasswordSchema"),
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
        },
      },
    },
    resetPassword,
  );

  app.log.info("user routes registered");
}
