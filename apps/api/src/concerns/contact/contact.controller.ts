import { db } from "../../utils/db";
import { FastifyReply, FastifyRequest } from "fastify";
import {
    AddGroupsToContactInput,
    CreateContactHistoryEventNoteInput,
    CreateContactInput,
    CreateContactTaskInput,
    UpdateContactInput,
    UpdateContactTaskInput,
} from "./contact.schema";
import { SpanKind, context, trace } from "@opentelemetry/api";
import { app, tracer } from "../..";
import {
    createContactHistoryEvent,
    createNewContact,
    getContactByContactIdByUserId,
    updateExistingContact,
} from "./contact.service";

export async function getContact(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
) {
    const getContactSpan = tracer.startSpan("get-contact", {
        kind: SpanKind.SERVER,
    });
    const { id: contactId } = req.params;

    let contact: any;

    await context.with(
        trace.setSpan(context.active(), getContactSpan),
        async () => {
            const querySpan = tracer.startSpan("get-contact-query", {
                kind: SpanKind.SERVER,
            });

            contact = await getContactByContactIdByUserId(
                contactId,
                req.user.id
            );

            querySpan.end();
        }
    );

    getContactSpan.end();
    return reply.send(contact);
}

export async function getContacts(req: FastifyRequest, reply: FastifyReply) {
    const span = tracer.startSpan("get-contacts", {
        kind: SpanKind.SERVER,
    });
    const contacts = await db.contact.findMany({
        where: {
            userId: req.user.id,
        },
        orderBy: {
            firstName: "asc",
        },
        take: 100,
    });

    span.end();
    return reply.send(contacts);
}

export async function createContact(
    req: FastifyRequest<{ Body: CreateContactInput }>,
    reply: FastifyReply
) {
    const span = tracer.startSpan("create-contact", {
        kind: SpanKind.SERVER,
    });
    try {
        const newContact = await createNewContact(req.body, req.user.id);

        if (newContact) {
            const historyEvent = await createContactHistoryEvent(
                req.user.id,
                newContact.id,
                "CREATED"
            );

            newContact.historyEvents.unshift(historyEvent);
        }

        span.addEvent("Contact created");
        span.end();
        return reply.send(newContact);
    } catch (error) {
        app.log.error(error);
        span.addEvent("Error creating contact");
        span.end();
        return reply.status(500).send();
    }
}

export async function updateContact(
    req: FastifyRequest<{ Body: UpdateContactInput }>,
    reply: FastifyReply
) {
    const span = tracer.startSpan("update-contact", {
        kind: SpanKind.SERVER,
    });
    const updatedContact = await updateExistingContact(req.body, req.user.id);

    if (updatedContact) {
        const historyEvent = await createContactHistoryEvent(
            req.user.id,
            updatedContact.id,
            "UPDATED"
        );
        updatedContact.historyEvents.unshift(historyEvent);
    }

    span.addEvent("Contact updated");
    span.end();
    return reply.send(updatedContact);
}

export async function createContactTask(
    req: FastifyRequest<{
        Params: { id: string };
        Body: CreateContactTaskInput;
    }>,
    reply: FastifyReply
) {
    const createContactTask = tracer.startSpan("create-contact-task-called", {
        kind: SpanKind.SERVER,
    });
    const { dueAt, description, name } = req.body;
    const { id: contactId } = req.params;

    let contact: any;

    await context.with(
        trace.setSpan(context.active(), createContactTask),
        async () => {
            const getContactSpan = tracer.startSpan("database-get-contact", {
                kind: SpanKind.SERVER,
            });

            contact = await getContactByContactIdByUserId(
                contactId,
                req.user.id
            );

            if (!contact) {
                getContactSpan.addEvent("Contact not found");
                getContactSpan.end();
                return reply.status(404).send();
            }

            getContactSpan.addEvent("Contact found");

            await context.with(
                trace.setSpan(context.active(), getContactSpan),
                async () => {
                    const createContactTaskSpan = tracer.startSpan(
                        "database-create-contact-task",
                        {
                            kind: SpanKind.SERVER,
                        }
                    );

                    const task = await db.contactTask.create({
                        data: {
                            contactId: contact.id,
                            name,
                            description,
                            dueAt: new Date(dueAt),
                        },
                    });

                    if (contact.tasks.length > 0) {
                        // loop through tasks and insert new task in the correct order
                        for (let i = 0; i < contact.tasks.length; i++) {
                            if (contact.tasks[i]) {
                                if (contact.tasks[i]!.dueAt > task.dueAt) {
                                    contact.tasks.splice(i, 0, task);
                                    createContactTaskSpan.addEvent(
                                        "Task inserted in correct order"
                                    );
                                    break;
                                }
                            }
                        }

                        if (!contact.tasks.includes(task)) {
                            contact.tasks.push(task);
                            createContactTaskSpan.addEvent(
                                "Task added to end of list"
                            );
                        }
                    } else {
                        contact.tasks.push(task);
                        createContactTaskSpan.addEvent(
                            "Task added to empty list"
                        );
                    }

                    await context.with(
                        trace.setSpan(context.active(), createContactTaskSpan),
                        async () => {
                            const createContactHistoryEventSpan =
                                tracer.startSpan(
                                    "create-contact-history-event",
                                    {
                                        kind: SpanKind.SERVER,
                                    }
                                );

                            const newHistoryEvent =
                                await createContactHistoryEvent(
                                    req.user.id,
                                    contact.id,
                                    "TASK_CREATED"
                                );
                            contact.historyEvents.unshift(newHistoryEvent);

                            createContactHistoryEventSpan.addEvent(
                                "History event created"
                            );
                            createContactHistoryEventSpan.end();
                        }
                    );

                    createContactTaskSpan.end();
                }
            );

            getContactSpan.end();
        }
    );

    createContactTask.end();
    return reply.send(contact);
}

export async function updateContactTask(
    req: FastifyRequest<{
        Params: { id: string; taskId: string };
        Body: UpdateContactTaskInput;
    }>,
    reply: FastifyReply
) {
    const span = tracer.startSpan("update-contact-task", {
        kind: SpanKind.SERVER,
    });
    const { status } = req.body;
    const { id: contactId, taskId } = req.params;
    const contact = await getContactByContactIdByUserId(contactId, req.user.id);

    if (!contact) {
        span.addEvent("Contact not found");
        span.end();
        return reply.status(404).send();
    }

    span.addEvent("Contact found");

    const task = await db.contactTask.update({
        where: {
            id: taskId,
        },
        data: {
            status: status as any,
        },
    });

    span.addEvent("Task updated");

    const taskIndex = contact.tasks.findIndex((t: any) => t.id === taskId);
    contact.tasks[taskIndex] = task;

    span.addEvent("Task updated in list");

    if (status === "DONE") {
        const newEvent = await createContactHistoryEvent(
            req.user.id,
            contact.id,
            "TASK_UPDATED",
            `Task "${task.name}" marked as done`
        );

        contact.historyEvents.unshift(newEvent);

        span.addEvent("History event created");
    }

    span.end();
    return reply.send(contact);
}

export async function createContactHistoryEventNote(
    req: FastifyRequest<{
        Params: { id: string };
        Body: CreateContactHistoryEventNoteInput;
    }>,
    reply: FastifyReply
) {
    const span = tracer.startSpan("create-contact-history-event-note", {
        kind: SpanKind.SERVER,
    });
    const { note } = req.body;
    const { id: contactId } = req.params;
    const contact = await getContactByContactIdByUserId(contactId, req.user.id);

    if (!contact) {
        span.addEvent("Contact not found");
        span.end();
        return reply.status(404).send();
    }

    span.addEvent("Contact found");

    const historyEvent = await createContactHistoryEvent(
        req.user.id,
        contact.id,
        "NOTE",
        note
    );

    span.addEvent("History event created");

    contact.historyEvents.unshift(historyEvent);

    span.addEvent("History event added to list");

    span.end();
    return reply.send(contact);
}

export async function addGroupsToContact(
    req: FastifyRequest<{
        Params: { id: string };
        Body: AddGroupsToContactInput;
    }>,
    reply: FastifyReply
) {
    const span = tracer.startSpan("add-groups-to-contact", {
        kind: SpanKind.SERVER,
    });
    const { id: contactId } = req.params;
    const { groupIds } = req.body;

    const contact = await db.contact.findUnique({
        where: {
            id: contactId,
        },
        include: {
            groups: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });

    if (!contact) {
        span.addEvent("Contact not found");
        span.end();
        return reply.status(404).send();
    }

    span.addEvent("Contact found");

    const groupIdsToAdd = groupIds.filter(
        (groupId) => !contact.groups.some((group: any) => group.id === groupId)
    );

    if (groupIdsToAdd.length === 0) {
        span.addEvent("No groups to add");
        span.end();
        return reply.send(contact);
    }

    const groups = await db.contactGroup.findMany({
        where: {
            id: {
                in: groupIdsToAdd,
            },
        },
    });

    if (groups.length === 0) {
        span.addEvent("No groups found");
        span.end();
        return reply.status(404).send();
    }

    const updatedContact = await db.contact.update({
        where: {
            id: contactId,
        },
        data: {
            groups: {
                connect: groups.map((group: any) => ({
                    id: group.id,
                })),
            },
        },
        include: {
            historyEvents: {
                orderBy: {
                    createdAt: "desc",
                },
            },
            groups: {
                select: {
                    id: true,
                    name: true,
                },
            },
            tasks: {
                orderBy: {
                    dueAt: "asc",
                },
            },
        },
    });

    span.addEvent("Groups added");

    const historyEvent = await createContactHistoryEvent(
        req.user.id,
        updatedContact.id,
        "GROUPS_ADDED",
        `Added to groups: ${groups.map((group: any) => group.name).join(", ")}`
    );

    span.addEvent("History event created");

    updatedContact.historyEvents.unshift(historyEvent);

    span.addEvent("History event added to list");

    return reply.send(updatedContact);
}

export async function removeGroupFromContact(
    req: FastifyRequest<{
        Params: { id: string; groupId: string };
    }>,
    reply: FastifyReply
) {
    const span = tracer.startSpan("remove-group-from-contact", {
        kind: SpanKind.SERVER,
    });
    const { id: contactId, groupId } = req.params;

    const updatedContact = await db.contact.update({
        where: {
            id: contactId,
        },
        data: {
            groups: {
                disconnect: {
                    id: groupId,
                },
            },
        },
        include: {
            historyEvents: {
                orderBy: {
                    createdAt: "desc",
                },
            },
            groups: {
                select: {
                    id: true,
                    name: true,
                },
            },
            tasks: {
                orderBy: {
                    dueAt: "asc",
                },
            },
        },
    });

    if (!updatedContact) {
        span.addEvent("Contact not found");
        span.end();
        return reply.status(404).send();
    }

    span.addEvent("Contact found");

    const removedGroup = await db.contactGroup.findUnique({
        where: {
            id: groupId,
        },
        select: {
            name: true,
        },
    });

    if (!removedGroup) {
        span.addEvent("Group not found");
        span.end();
        return reply.status(404).send();
    }

    const historyEvent = await createContactHistoryEvent(
        req.user.id,
        updatedContact.id,
        "GROUP_REMOVED",
        `Removed from group: ${removedGroup.name}`
    );

    span.addEvent("History event created");

    updatedContact.historyEvents.unshift(historyEvent);

    span.addEvent("History event added to list");

    span.end();
    return reply.send(updatedContact);
}
