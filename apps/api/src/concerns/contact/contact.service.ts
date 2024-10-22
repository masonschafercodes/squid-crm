import { ContactHistoryEventType } from "@repo/db";
import { db } from "../../utils/db";
import { CreateContactInput } from "./contact.schema";

const DEFAULT_CONTACT_INCLUDE = {
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
};

export async function getContactByContactIdByUserId(
    contactId: string,
    userId: string
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

export async function upsertContact(
    contact: CreateContactInput,
    userId: string
) {
    return await db.contact.upsert({
        create: {
            userId: userId,
            firstName: contact.firstName,
            lastName: contact.lastName,
            middleName: contact.middleName,
            suffix: contact.suffix,
            salutation: contact.salutation,
            workEmail: contact.workEmail,
            personalEmail: contact.personalEmail,
            workPhone: contact.workPhone,
            personalPhone: contact.personalPhone,
            workAddress: contact.workAddress,
            personalAddress: contact.personalAddress,
            jobTitle: contact.jobTitle,
            backgroundInfo: contact.backgroundInfo,
        },
        update: {
            firstName: contact.firstName,
            lastName: contact.lastName,
            middleName: contact.middleName,
            suffix: contact.suffix,
            salutation: contact.salutation,
            workEmail: contact.workEmail,
            personalEmail: contact.personalEmail,
            workPhone: contact.workPhone,
            personalPhone: contact.personalPhone,
            workAddress: contact.workAddress,
            personalAddress: contact.personalAddress,
            jobTitle: contact.jobTitle,
            backgroundInfo: contact.backgroundInfo,
        },
        where: {
            id: contact.id,
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

export async function createContactHistoryEvent(
    userId: string,
    contactId: string,
    type: ContactHistoryEventType,
    note?: string
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
