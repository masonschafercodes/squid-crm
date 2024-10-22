import { FastifyInstance } from 'fastify';
import { $ref } from './profile.schema';
import { createOrUpdateProfile, getProfile } from './profile.controller';

export async function profileRoutes(app: FastifyInstance) {
	app.get(
		'/',
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
					200: $ref('getProfileResponseSchema'),
				},
			},
		},
		getProfile,
	);

	app.post(
		'/',
		{
			preHandler: [app.authenticate],
			config: {
				rateLimit: {
					max: 500,
					timeWindow: 5000,
				},
			},
			schema: {
				body: $ref('createOrUpdateProfileSchema'),
				response: {
					200: $ref('getProfileResponseSchema'),
				},
			},
		},
		createOrUpdateProfile,
	);

	app.log.info('Profile routes registered');
}
