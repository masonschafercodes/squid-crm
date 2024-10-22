import { z } from 'zod';
import { buildJsonSchemas } from 'fastify-zod';

const createGroupSchema = z.object({
	name: z.string(),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;

const getGroupResponseSchema = z.object({
	id: z.string(),
	name: z.string(),
});

const getGroupResponseSchemaArray = z.array(getGroupResponseSchema);

export type GetGroupResponse = z.infer<typeof getGroupResponseSchema>;

export const { schemas: groupSchemas, $ref } = buildJsonSchemas(
	{
		createGroupSchema,
		getGroupResponseSchema,
		getGroupResponseSchemaArray,
	},
	{
		$id: 'group',
	},
);
