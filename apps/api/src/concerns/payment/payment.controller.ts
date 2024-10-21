import { db } from "@/utils/db";
import {
  cancelSubscription,
  createCheckout,
  lemonSqueezySetup,
  NewCheckout,
} from "@lemonsqueezy/lemonsqueezy.js";
import { FastifyReply, FastifyRequest } from "fastify";

lemonSqueezySetup({
  apiKey: process.env.LS_API_KEY as string,
  onError: (error) => {
    console.error("Error", error);
  },
});

export async function handleLemonSqueezyWebhook(
  req: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const reqBody = req.body as any;

    const eventName = reqBody.meta.event_name;
    const lemonSqueezyId = parseInt(reqBody.data.id);

    let variant_id, userId, customerId, subscriptionData;

    if (
      eventName === "subscription_created" ||
      eventName === "subscription_updated" ||
      eventName === "subscription_cancelled" ||
      eventName === "order_created"
    ) {
      subscriptionData = reqBody.data.attributes;
      userId = reqBody.meta.custom_data
        ? reqBody.meta.custom_data.user_id.toString()
        : null;
      customerId = subscriptionData.customer_id;
      variant_id = subscriptionData.first_subscription_item
        ? subscriptionData.variant_id
        : null;
    }

    switch (eventName) {
      case "subscription_created":
      case "subscription_updated":
        await db.subscription.upsert({
          where: { lemonSqueezyId: lemonSqueezyId },
          update: {
            status: subscriptionData.status,
            renewsAt: subscriptionData.renews_at
              ? new Date(subscriptionData.renews_at)
              : null,
            endsAt: subscriptionData.ends_at
              ? new Date(subscriptionData.ends_at)
              : null,
            trialEndsAt: subscriptionData.trial_ends_at
              ? new Date(subscriptionData.trial_ends_at)
              : null,
            userId: userId,
            customerId: customerId,
          },
          create: {
            lemonSqueezyId: lemonSqueezyId,
            customerId: customerId,
            orderId: subscriptionData.order_id,
            name: subscriptionData.product_name,
            email: subscriptionData.user_email,
            status: subscriptionData.status,
            renewsAt: subscriptionData.renews_at
              ? new Date(subscriptionData.renews_at)
              : null,
            endsAt: subscriptionData.ends_at
              ? new Date(subscriptionData.ends_at)
              : null,
            trialEndsAt: subscriptionData.trial_ends_at
              ? new Date(subscriptionData.trial_ends_at)
              : null,
            user: {
              connect: { id: userId },
            },
          },
        });
        break;
      case "subscription_cancelled":
        await db.subscription.update({
          where: { lemonSqueezyId: lemonSqueezyId },
          data: { status: "cancelled", endsAt: new Date() },
        });
        break;
      default:
        throw new Error(`Unhandled event: ${eventName}`);
    }

    return reply.status(200).send({ message: "Webhook received" });
  } catch (error) {
    return reply.status(500).send({ message: "Error processing webhook" });
  }
}

export async function handleCancelLemonSqueezySubscription(
  req: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const payment = await db.subscription.findFirst({
      where: {
        userId: req.user.id,
        status: "active",
      },
    });

    if (!payment) {
      return reply.status(400).send({
        message: "You do not have an active subscription",
      });
    }

    const { statusCode, error, data } = await cancelSubscription(
      payment.lemonSqueezyId
    );

    if (error || !data) {
      return reply
        .status(400)
        .send({ message: "Error cancelling subscription", statusCode, error });
    }

    return reply.status(200).send({ message: "Subscription cancelled" });
  } catch (error) {
    return reply.status(500).send({ message: "Error cancelling subscription" });
  }
}

export async function handleLemonSqueezyCheckout(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const attributes: NewCheckout = {
    checkoutOptions: {
      embed: true,
      media: false,
    },
    checkoutData: {
      email: req.user.email,
      custom: {
        user_id: req.user.id,
      },
    },
    productOptions: {
      redirectUrl: `${process.env.SITE_URL}`,
      receiptLinkUrl: `${process.env.SITE_URL}`,
      receiptButtonText: "Go back",
      receiptThankYouNote: "Thank you for signing up!",
    },
  };

  try {
    const payment = await db.subscription.findFirst({
      where: {
        userId: req.user.id,
        status: "active",
      },
    });

    if (payment) {
      return reply.status(400).send({
        message: "You already have an active subscription",
      });
    }

    const { statusCode, error, data } = await createCheckout(
      129160,
      556162,
      attributes
    );

    if (error || !data) {
      return reply
        .status(400)
        .send({ message: "Error creating checkout", statusCode, error });
    }

    return reply.status(200).send({
      url: data.data.attributes.url,
    });
  } catch (error) {
    return reply.status(500).send({ message: "Error creating checkout" });
  }
}

export async function handleGetPayments(
  req: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const payments = await db.subscription.findMany({
      where: {
        userId: req.user.id,
      },
    });

    return reply.status(200).send(payments);
  } catch (error) {
    return reply.status(500).send({ message: "Error fetching payments" });
  }
}
