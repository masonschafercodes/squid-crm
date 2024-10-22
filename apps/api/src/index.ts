import "dotenv/config";
import "./utils/otel";
import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import fjwt, { FastifyJWT } from "@fastify/jwt";
import fCookie from "@fastify/cookie";
import rateLimit from "@fastify/rate-limit";
import cors from "@fastify/cors";
import fastifyRedis from "@fastify/redis";
import api, { SpanKind } from "@opentelemetry/api";
import { userSchemas } from "./concerns/user/user.schema";
import { userRoutes } from "./concerns/user/user.route";
import { profileSchemas } from "./concerns/profile/profile.schema";
import { profileRoutes } from "./concerns/profile/profile.route";
import { paymentRoutes } from "./concerns/payment/payment.route";
import { contactSchemas } from "./concerns/contact/contact.schema";
import { contactRoutes } from "./concerns/contact/contact.route";
import { groupSchemas } from "./concerns/group/group.schema";
import { groupRoutes } from "./concerns/group/group.route";
import { logger } from "./utils/logger";

export const tracer = api.trace.getTracer("fastify-server");
export const app = Fastify({ logger: process.env.NODE_ENV === "development" });
const port = +process.env.PORT! || 3001;
const host = process.env.HOST! || "localhost";

app.register(cors, {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
});

app.register(fastifyRedis, {
    host: process.env.REDIS_HOST!,
    port: +process.env.REDIS_PORT!,
});

app.register(rateLimit, {
    global: false,
    max: 100,
    timeWindow: 1000 * 60 * 15,
});

app.register(fjwt, { secret: process.env.JWT_SECRET! });

// some otel decorators for convenience

app.decorate("newSpan", (name: string) => {
    return tracer.startSpan(name, {
        kind: SpanKind.SERVER,
    });
});

app.decorate(
    "authenticate",
    async (request: FastifyRequest, reply: FastifyReply) => {
        const token = request.cookies.access_token;
        const span = tracer.startSpan("auth-middleware", {
            kind: SpanKind.SERVER,
        });

        if (!token) {
            span.addEvent("Authentication failed");
            span.end();
            return reply
                .status(401)
                .send({ message: "Authentication required" });
        }

        try {
            const decoded = request.jwt.verify<FastifyJWT["user"]>(token);
            request.user = decoded;
            span.setAttribute("user.id", decoded.id);
            span.setAttribute("user.email", decoded.email);
            span.end();
        } catch (error) {
            span.addEvent("Authentication failed");
            span.end();
            return reply.status(401).send({ message: "Authentication failed" });
        }
    }
);

app.addHook("preHandler", (request, _reply, next) => {
    const span = tracer.startSpan(request.url, {
        kind: SpanKind.SERVER,
    });

    span.setAttribute("http.method", request.method);
    span.setAttribute("http.url", request.url);

    request.log.info({ spanId: span.spanContext().spanId }, "Request received");

    request.span = span;
    return next();
});

app.addHook("preHandler", (request, reply, next) => {
    request.jwt = app.jwt;
    return next();
});

app.register(fCookie, {
    secret: process.env.COOKIE_SECRET!,
    hook: "preHandler",
});

for (let schema of [
    ...userSchemas,
    ...profileSchemas,
    ...contactSchemas,
    ...groupSchemas,
]) {
    app.addSchema(schema);
}

app.register(userRoutes, { prefix: "api/users" });
app.register(profileRoutes, { prefix: "api/profiles" });
app.register(paymentRoutes, { prefix: "api/payments" });
app.register(contactRoutes, { prefix: "api/contacts" });
app.register(groupRoutes, { prefix: "api/groups" });

app.get("/healthcheck", async (request, reply) => {
    reply.send({ status: "ok" });
});

app.setErrorHandler((error, request, reply) => {
    request.log.error(error);
    logger.error(error);
    reply.send({ message: error.message });
});

app.setNotFoundHandler((request, reply) => {
    logger.warn("Route Not Found", { url: request.url });
    reply.status(404).send({ message: "Not found" });
});

const listeners = ["SIGINT", "SIGTERM"];
listeners.forEach((signal) => {
    process.on(signal, async () => {
        await app.close();
        process.exit(0);
    });
});

app.listen({ port, host }, async function (err, addr) {
    if (err) {
        logger.error(err);
        app.log.error(err);
        process.exit(1);
    }

    app.log.info(`Server listening at ${addr}`);
});
