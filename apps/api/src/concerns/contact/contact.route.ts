import { FastifyInstance } from "fastify";
import { $ref } from "./contact.schema";
import {
    addGroupsToContact,
    createContact,
    createContactHistoryEventNote,
    createContactTask,
    getContact,
    getContacts,
    removeGroupFromContact,
    updateContact,
    updateContactTask,
} from "./contact.controller";

export async function contactRoutes(app: FastifyInstance) {
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
                    200: $ref("getContactResponseSchemaArray"),
                },
            },
        },
        getContacts
    );

    app.get(
        "/:id",
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
                    200: $ref("getContactResponseSchema"),
                },
                params: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                    },
                },
            },
        },
        getContact
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
                body: $ref("createContactSchema"),
                response: {
                    200: $ref("getContactResponseSchema"),
                },
            },
        },
        createContact
    );

    app.patch(
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
                body: $ref("updateContactSchema"),
                response: {
                    200: $ref("getContactResponseSchema"),
                },
            },
        },
        updateContact
    );

    app.post(
        "/:id/notes",
        {
            preHandler: [app.authenticate],
            config: {
                rateLimit: {
                    max: 500,
                    timeWindow: 5000,
                },
            },
            schema: {
                body: $ref("createContactHistoryEventNoteSchema"),
                response: {
                    200: $ref("getContactResponseSchema"),
                },
            },
        },
        createContactHistoryEventNote
    );

    app.post(
        "/:id/tasks",
        {
            preHandler: [app.authenticate],
            config: {
                rateLimit: {
                    max: 500,
                    timeWindow: 5000,
                },
            },
            schema: {
                body: $ref("createContactTaskSchema"),
                response: {
                    200: $ref("getContactResponseSchema"),
                },
            },
        },
        createContactTask
    );

    app.patch(
        "/:id/tasks/:taskId",
        {
            preHandler: [app.authenticate],
            config: {
                rateLimit: {
                    max: 500,
                    timeWindow: 5000,
                },
            },
            schema: {
                body: $ref("updateContactTaskSchema"),
                response: {
                    200: $ref("getContactResponseSchema"),
                },
            },
        },
        updateContactTask
    );

    app.patch(
        "/:id/groups",
        {
            preHandler: [app.authenticate],
            config: {
                rateLimit: {
                    max: 500,
                    timeWindow: 5000,
                },
            },
            schema: {
                body: $ref("addGroupsToContactSchema"),
                response: {
                    200: $ref("getContactResponseSchema"),
                },
            },
        },
        addGroupsToContact
    );

    app.delete(
        "/:id/groups/:groupId",
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
                    200: $ref("getContactResponseSchema"),
                },
            },
        },
        removeGroupFromContact
    );

    app.log.info("Contact routes registered");
}
