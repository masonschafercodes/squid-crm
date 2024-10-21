import { FastifyReply, FastifyRequest } from "fastify";
import {
  CreatePasswordResetInput,
  CreateUserInput,
  LoginUserInput,
  ResetPasswordInput,
} from "./user.schema";
import { db } from "@/utils/db";
import { hash, verify } from "argon2";

export async function createUser(
  req: FastifyRequest<{ Body: CreateUserInput }>,
  reply: FastifyReply
) {
  const { email, password } = req.body;

  const user = await db.user.findUnique({
    where: {
      email,
    },
  });

  if (user) {
    return reply.status(400).send({
      error: "Could't create user",
    });
  }

  try {
    const hashedPassword = await hash(password);
    const newUser = await db.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    if (!newUser) {
      throw new Error("Couldn't create user");
    }

    await db.userProfile.create({
      data: {
        userId: newUser.id,
      },
    });

    return reply.status(201).send(newUser);
  } catch (e: any) {
    return reply.status(500).send({
      error: e.message,
    });
  }
}

export async function loginUser(
  req: FastifyRequest<{ Body: LoginUserInput }>,
  reply: FastifyReply
) {
  const { email, password } = req.body;

  const user = await db.user.findUnique({
    where: {
      email,
    },
  });

  const isMatch = user && (await verify(user.password, password));
  if (!user || !isMatch) {
    return reply.code(401).send({
      message: "Invalid email or password",
    });
  }

  const payload = {
    id: user.id,
    email: user.email,
  };
  const token = req.jwt.sign(payload);

  reply.setCookie("access_token", token, {
    path: "/",
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  return { user: payload, accessToken: token };
}

export async function requestPasswordReset(
  req: FastifyRequest<{ Body: CreatePasswordResetInput }>,
  reply: FastifyReply
) {
  const { email } = req.body;

  const user = await db.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    console.log("user not found when requesting password reset");
    return reply.send({ message: "Password reset requested" });
  }

  const passwordResetToken = req.jwt.sign({ email }, { expiresIn: "1h" });
  await db.passwordResetRequest.create({
    data: {
      token: passwordResetToken,
      userId: user.id,
    },
  });

  reply.clearCookie("access_token");
  return reply.send({ message: "Password reset requested" });
}

export async function resetPassword(
  req: FastifyRequest<{ Body: ResetPasswordInput }>,
  reply: FastifyReply
) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return reply.status(401).send({ message: "Authorization Required" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return reply.status(401).send({ message: "Authorization Required" });
  }

  try {
    const decoded = req.jwt.verify<{ email: string }>(token);
    const { email } = decoded;

    const user = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return reply.status(404).send({ message: "User not found" });
    }

    const { password } = req.body;
    const hashedPassword = await hash(password);
    const updatedUser = await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    await db.passwordResetRequest.deleteMany({
      where: {
        userId: updatedUser.id,
      },
    });

    reply.clearCookie("access_token");
    return reply.send({ message: "Password reset successful" });
  } catch (error: any) {
    return reply.status(401).send({ message: error.message });
  }
}

export async function logoutUser(req: FastifyRequest, reply: FastifyReply) {
  reply.clearCookie("access_token");
  return reply.send({ message: "Logout successful" });
}

export async function getUser(req: FastifyRequest, reply: FastifyReply) {
  return reply.send(req.user);
}
