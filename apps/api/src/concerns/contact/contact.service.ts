import { db } from "../../utils/db";

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
