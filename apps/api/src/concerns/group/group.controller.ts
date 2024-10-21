import { db } from "@/utils/db";
import { FastifyReply, FastifyRequest } from "fastify";
import { CreateGroupInput } from "./group.schema";

export async function getGroups(req: FastifyRequest, reply: FastifyReply) {
  const groups = await db.contactGroup.findMany({
    where: {
      userId: req.user.id,
    },
    orderBy: {
      name: "asc",
    },
  });

  return reply.send(groups);
}

export async function createGroup(
  req: FastifyRequest<{ Body: CreateGroupInput }>,
  reply: FastifyReply
) {
  const { name } = req.body;

  const group = await db.contactGroup.create({
    data: {
      name,
      userId: req.user.id,
    },
  });

  return reply.send(group);
}
