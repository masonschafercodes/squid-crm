import { JWT } from "@fastify/jwt";

// adding jwt property to req
// authenticate property to FastifyInstance
declare module "fastify" {
  interface FastifyRequest {
    jwt: JWT;
    span: any;
  }
  export interface FastifyInstance {
    authenticate: any;
  }
}

type UserPayload = {
  id: string;
  email: string;
};

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: UserPayload;
  }
}
