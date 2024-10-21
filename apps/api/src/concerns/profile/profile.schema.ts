import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";

const createOrUpdateProfileSchema = z.object({
  name: z.string().optional(),
  bio: z.string().optional(),
});

export type CreateOrUpdateProfileInput = z.infer<
  typeof createOrUpdateProfileSchema
>;

const getProfileResponseSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  bio: z.string().optional(),
});

export type GetProfileResponse = z.infer<typeof getProfileResponseSchema>;

export const { schemas: profileSchemas, $ref } = buildJsonSchemas(
  {
    createOrUpdateProfileSchema,
    getProfileResponseSchema,
  },
  {
    $id: "profile",
  }
);
