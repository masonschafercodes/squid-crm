import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";

const createContactSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  middleName: z.string().optional(),
  suffix: z.string().optional(),
  salutation: z.string().optional(),
  workEmail: z.string().optional(),
  personalEmail: z.string().optional(),
  workPhone: z.string().optional(),
  personalPhone: z.string().optional(),
  workAddress: z.string().optional(),
  personalAddress: z.string().optional(),
  jobTitle: z.string().optional(),
  backgroundInfo: z.string().optional(),
  birthday: z.string().optional(),
});

const updateContactSchema = z.object({
  id: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  middleName: z.string().optional(),
  suffix: z.string().optional(),
  salutation: z.string().optional(),
  workEmail: z.string().optional(),
  personalEmail: z.string().optional(),
  workPhone: z.string().optional(),
  personalPhone: z.string().optional(),
  workAddress: z.string().optional(),
  personalAddress: z.string().optional(),
  jobTitle: z.string().optional(),
  backgroundInfo: z.string().optional(),
  birthday: z.string().optional(),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;

const createContactHistoryEventNoteSchema = z.object({
  note: z.string(),
});

export type CreateContactHistoryEventNoteInput = z.infer<
  typeof createContactHistoryEventNoteSchema
>;

const createContactTaskSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  dueAt: z.string(),
});

export type CreateContactTaskInput = z.infer<typeof createContactTaskSchema>;

const updateContactTaskSchema = z.object({
  status: z.string(),
});

export type UpdateContactTaskInput = z.infer<typeof updateContactTaskSchema>;

const getContactResponseSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  middleName: z.string().optional(),
  suffix: z.string().optional(),
  salutation: z.string().optional(),
  workEmail: z.string().optional(),
  personalEmail: z.string().optional(),
  workPhone: z.string().optional(),
  personalPhone: z.string().optional(),
  workAddress: z.string().optional(),
  personalAddress: z.string().optional(),
  jobTitle: z.string().optional(),
  backgroundInfo: z.string().optional(),
  birthday: z.string().optional(),
  groups: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .array()
    .optional(),
  tasks: z
    .object({
      id: z.string(),
      contactId: z.string(),
      name: z.string(),
      description: z.string().optional(),
      dueAt: z.string(),
      status: z.string(),
      createdAt: z.string(),
      updatedAt: z.string(),
    })
    .array()
    .optional(),
  historyEvents: z
    .object({
      id: z.string(),
      type: z.string(),
      createdAt: z.string(),
      updatedAt: z.string(),
      userId: z.string(),
      contactId: z.string(),
      note: z.string().optional(),
    })
    .array()
    .optional(),
});

const getContactResponseSchemaArray = z.array(getContactResponseSchema);

export type GetContactResponse = z.infer<typeof getContactResponseSchema>;

const addGroupsToContactSchema = z.object({
  groupIds: z.string().array(),
});

export type AddGroupsToContactInput = z.infer<typeof addGroupsToContactSchema>;

export const { schemas: contactSchemas, $ref } = buildJsonSchemas(
  {
    createContactSchema,
    getContactResponseSchema,
    getContactResponseSchemaArray,
    createContactHistoryEventNoteSchema,
    createContactTaskSchema,
    updateContactTaskSchema,
    addGroupsToContactSchema,
    updateContactSchema,
  },
  {
    $id: "contact",
  },
);
