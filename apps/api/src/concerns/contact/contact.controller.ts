import { db } from "../../utils/db";
import { FastifyReply, FastifyRequest } from "fastify";
import {
  AddGroupsToContactInput,
  CreateContactHistoryEventNoteInput,
  CreateContactInput,
  CreateContactTaskInput,
  UpdateContactTaskInput,
} from "./contact.schema";

export async function getContact(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const contact = await db.contact.findUnique({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
    include: {
      groups: {
        select: {
          id: true,
          name: true,
        },
      },
      historyEvents: {
        orderBy: {
          createdAt: "desc",
        },
      },
      tasks: {
        orderBy: {
          dueAt: "asc",
        },
      },
    },
  });

  return reply.send(contact);
}

export async function getContacts(req: FastifyRequest, reply: FastifyReply) {
  const contacts = await db.contact.findMany({
    where: {
      userId: req.user.id,
    },
    orderBy: {
      firstName: "asc",
    },
  });

  return reply.send(contacts);
}

export async function createContact(
  req: FastifyRequest<{ Body: CreateContactInput }>,
  reply: FastifyReply
) {
  const {
    id,
    firstName,
    lastName,
    middleName,
    suffix,
    salutation,
    workEmail,
    personalEmail,
    workPhone,
    personalPhone,
    workAddress,
    personalAddress,
    jobTitle,
    backgroundInfo,
  } = req.body;

  const contact = await db.contact.upsert({
    create: {
      userId: req.user.id,
      firstName,
      lastName,
      middleName,
      suffix,
      salutation,
      workEmail,
      personalEmail,
      workPhone,
      personalPhone,
      workAddress,
      personalAddress,
      jobTitle,
      backgroundInfo,
    },
    update: {
      firstName,
      lastName,
      middleName,
      suffix,
      salutation,
      workEmail,
      personalEmail,
      workPhone,
      personalPhone,
      workAddress,
      personalAddress,
      jobTitle,
      backgroundInfo,
    },
    where: {
      id,
      userId: req.user.id,
    },
    include: {
      groups: {
        select: {
          id: true,
          name: true,
        },
      },
      historyEvents: {
        orderBy: {
          createdAt: "desc",
        },
      },
      tasks: {
        orderBy: {
          dueAt: "asc",
        },
      },
    },
  });

  if (contact && id) {
    const historyEvent = await db.contactHistoryEvent.create({
      data: {
        userId: req.user.id,
        contactId: contact.id,
        type: "UPDATED",
      },
    });

    contact.historyEvents.unshift(historyEvent);
  }

  return reply.send(contact);
}

export async function createContactTask(
  req: FastifyRequest<{ Params: { id: string }; Body: CreateContactTaskInput }>,
  reply: FastifyReply
) {
  const { dueAt, description, name } = req.body;
  const { id: contactId } = req.params;
  const contact = await db.contact.findUnique({
    where: {
      id: contactId,
      userId: req.user.id,
    },
    include: {
      groups: {
        select: {
          id: true,
          name: true,
        },
      },
      historyEvents: {
        orderBy: {
          createdAt: "desc",
        },
      },
      tasks: {
        orderBy: {
          dueAt: "asc",
        },
      },
    },
  });

  if (!contact) {
    return reply.status(404).send();
  }

  const task = await db.contactTask.create({
    data: {
      contactId: contact.id,
      name,
      description,
      dueAt: new Date(dueAt),
    },
  });

  contact.tasks.unshift(task);

  await db.contactHistoryEvent.create({
    data: {
      userId: req.user.id,
      contactId: contact.id,
      type: "TASK_CREATED",
    },
  });

  return reply.send(contact);
}

export async function updateContactTask(
  req: FastifyRequest<{
    Params: { id: string; taskId: string };
    Body: UpdateContactTaskInput;
  }>,
  reply: FastifyReply
) {
  const { status } = req.body;
  const { id: contactId, taskId } = req.params;
  const contact = await db.contact.findUnique({
    where: {
      id: contactId,
      userId: req.user.id,
    },
    include: {
      groups: {
        select: {
          id: true,
          name: true,
        },
      },
      historyEvents: {
        orderBy: {
          createdAt: "desc",
        },
      },
      tasks: {
        orderBy: {
          dueAt: "asc",
        },
      },
    },
  });

  if (!contact) {
    return reply.status(404).send();
  }

  const task = await db.contactTask.update({
    where: {
      id: taskId,
    },
    data: {
      status: status as any,
    },
  });

  const taskIndex = contact.tasks.findIndex((t: any) => t.id === taskId);
  contact.tasks[taskIndex] = task;

  if (status === "DONE") {
    await db.contactHistoryEvent.create({
      data: {
        userId: req.user.id,
        contactId: contact.id,
        type: "TASK_UPDATED",
        note: `Task "${task.name}" marked as done`,
      },
    });
  }

  return reply.send(contact);
}

export async function createContactHistoryEventNote(
  req: FastifyRequest<{
    Params: { id: string };
    Body: CreateContactHistoryEventNoteInput;
  }>,
  reply: FastifyReply
) {
  const { note } = req.body;
  const { id: contactId } = req.params;
  const contact = await db.contact.findUnique({
    where: {
      id: contactId,
      userId: req.user.id,
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

  if (!contact) {
    return reply.status(404).send();
  }

  const historyEvent = await db.contactHistoryEvent.create({
    data: {
      userId: req.user.id,
      contactId: contact.id,
      type: "NOTE",
      note: note,
    },
  });

  contact.historyEvents.unshift(historyEvent);

  return reply.send(contact);
}

export async function addGroupsToContact(
  req: FastifyRequest<{
    Params: { id: string };
    Body: AddGroupsToContactInput;
  }>,
  reply: FastifyReply
) {
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
    return null;
  }

  const groupIdsToAdd = groupIds.filter(
    (groupId) => !contact.groups.some((group: any) => group.id === groupId)
  );

  if (groupIdsToAdd.length === 0) {
    return reply.send(contact);
  }

  const groups = await db.contactGroup.findMany({
    where: {
      id: {
        in: groupIdsToAdd,
      },
    },
  });

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

  const historyEvent = await db.contactHistoryEvent.create({
    data: {
      userId: req.user.id,
      contactId: updatedContact.id,
      type: "GROUPS_ADDED",
      note: `Added to groups: ${groups.map((group: any) => group.name).join(", ")}`,
    },
  });

  updatedContact.historyEvents.unshift(historyEvent);

  return reply.send(updatedContact);
}

export async function removeGroupFromContact(
  req: FastifyRequest<{
    Params: { id: string; groupId: string };
  }>,
  reply: FastifyReply
) {
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
    return reply.status(404).send();
  }

  const removedGroup = await db.contactGroup.findUnique({
    where: {
      id: groupId,
    },
    select: {
      name: true,
    },
  });

  const historyEvent = await db.contactHistoryEvent.create({
    data: {
      userId: req.user.id,
      contactId: updatedContact.id,
      type: "GROUP_REMOVED",
      note: `Removed from group: ${removedGroup?.name}`,
    },
  });

  updatedContact.historyEvents.unshift(historyEvent);

  return reply.send(updatedContact);
}
