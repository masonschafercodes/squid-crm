import { ContactHistoryEventType } from "@repo/db";
import { db } from "../../utils/db";
import { CreateContactInput, UpdateContactInput } from "./contact.schema";

export async function getContactByContactIdByUserId(
  contactId: string,
  userId: string,
) {
  return await db.contact.findUnique({
    where: {
      id: contactId,
      userId: userId,
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
}

export async function createNewContact(
  contact: CreateContactInput,
  userId: string,
) {
  return await db.contact.create({
    data: {
      ...contact,
      userId,
      birthday: contact.birthday ? new Date(contact.birthday) : undefined,
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
}

export async function updateExistingContact(
  contact: UpdateContactInput,
  userId: string,
) {
  return await db.contact.update({
    where: {
      id: contact.id,
      userId,
    },
    data: {
      ...contact,
      birthday: contact.birthday ? new Date(contact.birthday) : undefined,
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
}

export async function createContactHistoryEvent(
  userId: string,
  contactId: string,
  type: ContactHistoryEventType,
  note?: string,
) {
  return await db.contactHistoryEvent.create({
    data: {
      userId,
      contactId,
      type,
      note,
    },
  });
}
