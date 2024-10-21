import { FastifyReply, FastifyRequest } from "fastify";
import {
    CreatePasswordResetInput,
    CreateUserInput,
    LoginUserInput,
    ResetPasswordInput,
} from "./user.schema";
import { db } from "../../utils/db";
import { hash, verify } from "argon2";
import { SpanKind } from "@opentelemetry/api";
import { tracer } from "../..";

export async function createUser(
    req: FastifyRequest<{ Body: CreateUserInput }>,
    reply: FastifyReply
) {
    const span = tracer.startSpan("create-user", {
        kind: SpanKind.SERVER,
    });
    const { email, password } = req.body;

    span.setAttribute("email", email);
    const user = await db.user.findUnique({
        where: {
            email,
        },
    });

    if (user) {
        span.addEvent("User already exists");
        span.end();
        return reply.status(400).send({
            error: "Could't create user",
        });
    }

    try {
        span.addEvent("Creating user");
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

        span.setAttribute("user", JSON.stringify(newUser));
        span.addEvent("User created");

        await db.userProfile.create({
            data: {
                userId: newUser.id,
            },
        });

        span.addEvent("User profile created");
        span.end();

        return reply.status(201).send(newUser);
    } catch (e: any) {
        span.addEvent("User creation failed");
        return reply.status(500).send({
            error: e.message,
        });
    }
}

export async function loginUser(
    req: FastifyRequest<{ Body: LoginUserInput }>,
    reply: FastifyReply
) {
    const span = tracer.startSpan("login-user", {
        kind: SpanKind.SERVER,
    });
    const { email, password } = req.body;

    const user = await db.user.findUnique({
        where: {
            email,
        },
    });

    if (!user) {
        span.addEvent("User not found");
        span.end();
        return reply.status(401).send({
            message: "Invalid email or password",
        });
    }

    const isMatch = user && (await verify(user.password, password));
    if (!user || !isMatch) {
        span.addEvent("Invalid email or password");
        span.end();
        return reply.code(401).send({
            message: "Invalid email or password",
        });
    }

    const payload = {
        id: user.id,
        email: user.email,
    };
    const token = req.jwt.sign(payload);
    span.setAttribute("user", JSON.stringify(payload));

    reply.setCookie("access_token", token, {
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    span.addEvent("User logged in");
    span.end();

    return reply.status(201).send({ user: payload, accessToken: token });
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
    return reply.status(204).send({ message: "Logout successful" });
}

export async function getUser(req: FastifyRequest, reply: FastifyReply) {
    return reply.send(req.user);
}
