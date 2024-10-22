import { FastifyInstance } from 'fastify';
import {
	handleCancelLemonSqueezySubscription,
	handleGetPayments,
	handleLemonSqueezyCheckout,
	handleLemonSqueezyWebhook,
} from './payment.controller';

export async function paymentRoutes(app: FastifyInstance) {
	app.get(
		'/',
		{
			preHandler: [app.authenticate],
			config: {
				rateLimit: {
					max: 500,
					timeWindow: 5 * 60,
				},
			},
		},
		handleGetPayments,
	);

	app.post(
		'/cancel',
		{
			preHandler: [app.authenticate],
			config: {
				rateLimit: {
					max: 500,
					timeWindow: 5 * 60,
				},
			},
		},
		handleCancelLemonSqueezySubscription,
	);

	app.post(
		'/webhook',
		{
			config: {
				rateLimit: {
					max: 500,
					timeWindow: 5 * 60,
				},
			},
		},
		handleLemonSqueezyWebhook,
	);

	app.post(
		'/checkout',
		{
			preHandler: [app.authenticate],
			config: {
				rateLimit: {
					max: 10,
					timeWindow: 5 * 60,
				},
			},
		},
		handleLemonSqueezyCheckout,
	);
	app.log.info('Payment routes registered');
}
