import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";

const createUserSchema = z.object({
  email: z.string(),
  password: z.string().min(8),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

const createPasswordResetSchema = z.object({
  email: z.string().email(),
});

export type CreatePasswordResetInput = z.infer<
  typeof createPasswordResetSchema
>;

const resetPasswordSchema = z.object({
  password: z.string().min(8),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

const createUserResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
});

const getUserResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
});

export type GetUserResponse = z.infer<typeof getUserResponseSchema>;

const loginSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email(),
  password: z.string().min(6),
});

const loginResponseSchema = z.object({
  accessToken: z.string(),
  user: getUserResponseSchema,
});

export type LoginUserInput = z.infer<typeof loginSchema>;

export const { schemas: userSchemas, $ref } = buildJsonSchemas(
  {
    createUserSchema,
    createUserResponseSchema,
    loginSchema,
    loginResponseSchema,
    getUserResponseSchema,
    createPasswordResetSchema,
    resetPasswordSchema,
  },
  {
    $id: "user",
  }
);
