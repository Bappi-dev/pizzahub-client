import { ObjectId } from "mongodb";
import Stripe from "stripe";

import { db } from "@/lib/auth";

function getUserFilter(userId: string, userEmail?: string) {
  const identities: Array<Record<string, string | ObjectId>> = [
    { _id: userId },
    { id: userId },
  ];

  if (/^[\da-f]{24}$/i.test(userId)) {
    identities.push({ _id: new ObjectId(userId) });
  }
  if (userEmail) identities.push({ email: userEmail });

  return { $or: identities };
}

async function updatePlan(
  userId: string | null,
  userEmail: string | null,
  plan: "free" | "premium",
  subscriptionId?: string,
) {
  if (!userId && !userEmail) return false;

  const identity = userId ?? userEmail!;
  const filter = getUserFilter(identity, userEmail ?? undefined);
  const update = await db.collection("user").updateOne(filter, {
    $set: {
      plan,
      stripeSubscriptionId: plan === "premium" ? subscriptionId ?? null : null,
      planUpdatedAt: new Date(),
    },
  });

  return update.matchedCount > 0;
}

async function activateCheckoutSession(
  session: Stripe.Checkout.Session,
) {
  if (
    session.mode !== "subscription" ||
    (session.payment_status !== "paid" &&
      session.payment_status !== "no_payment_required")
  ) {
    return true;
  }

  const userId =
    session.metadata?.userId ?? session.client_reference_id ?? null;
  const userEmail =
    session.metadata?.userEmail ?? session.customer_details?.email ?? null;
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  const updated = await updatePlan(
    userId,
    userEmail,
    "premium",
    subscriptionId,
  );
  if (updated) {
    const filter = getUserFilter(userId ?? userEmail!, userEmail ?? undefined);
    const user = await db.collection("user").findOne(filter);
    await db.collection("transactions").updateOne(
      { providerId: session.id },
      {
        $setOnInsert: {
          providerId: session.id,
          vendorName:
            typeof user?.name === "string" ? user.name : "PizzaHub Vendor",
          plan: "premium",
          amount:
            typeof session.amount_total === "number"
              ? session.amount_total / 100
              : 0,
          currency: session.currency ?? "usd",
          status: "completed",
          createdAt: new Date(),
        },
      },
      { upsert: true },
    );
  }
  return updated;
}

async function syncSubscription(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId ?? null;
  const userEmail = subscription.metadata.userEmail ?? null;
  const plan =
    subscription.status === "active" || subscription.status === "trialing"
      ? "premium"
      : "free";

  return updatePlan(userId, userEmail, plan, subscription.id);
}

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");

  if (!secretKey || !webhookSecret) {
    return Response.json(
      { error: "Stripe webhook is not configured on the server." },
      { status: 500 },
    );
  }
  if (!signature) {
    return Response.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const stripe = new Stripe(secretKey);
  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return Response.json(
      { error: "Stripe webhook signature verification failed." },
      { status: 400 },
    );
  }

  let updated = true;
  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    updated = await activateCheckoutSession(
      event.data.object as Stripe.Checkout.Session,
    );
  } else if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    updated = await syncSubscription(
      event.data.object as Stripe.Subscription,
    );
  } else {
    return Response.json({ received: true });
  }

  if (!updated) {
    return Response.json(
      { error: "Could not match the Stripe event to a user account." },
      { status: 500 },
    );
  }

  return Response.json({ received: true });
}
