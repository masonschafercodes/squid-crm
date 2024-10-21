import { db } from "@/utils/db";
import { FastifyReply, FastifyRequest } from "fastify";
import { CreateOrUpdateProfileInput } from "./profile.schema";

export async function getProfile(req: FastifyRequest, reply: FastifyReply) {
  const profile = await db.userProfile.findUnique({
    where: {
      userId: req.user.id,
    },
  });

  if (!profile) {
    return reply.status(404).send({
      message: "Profile not found",
    });
  }

  return reply.send(profile);
}

export async function createOrUpdateProfile(
  req: FastifyRequest<{ Body: CreateOrUpdateProfileInput }>,
  reply: FastifyReply
) {
  const { name, bio } = req.body;

  const profile = await db.userProfile.upsert({
    where: {
      userId: req.user.id,
    },
    create: {
      name,
      bio,
      userId: req.user.id,
    },
    update: {
      name,
      bio,
    },
  });

  return reply.send(profile);
}
