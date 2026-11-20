import { headers } from "next/headers";
import Stripe from "stripe";

import { auth } from "@/lib/auth";

function hasPremiumSubscription(user: {
  plan?: string | null;
  subscriptionPlan?: string | null;
}) {
  return user.subscriptionPlan === "premium" || user.plan === "premium";
}

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  return secretKey ? new Stripe(secretKey) : null;
}

async function getVendorSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: "Sign in to manage your subscription.", status: 401 as const };
  }
  if (session.user.role !== "vendor") {
    return {
      error: "Only vendors can manage a subscription.",
      status: 403 as const,
    };
  }

  return { session };
}

export async function GET() {
  const result = await getVendorSession();
  if ("error" in result) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  const stripe = getStripe();
  const priceId = process.env.STRIPE_PREMIUM_PRICE_ID;
  if (!stripe || !priceId) {
    return Response.json({
      plan: hasPremiumSubscription(result.session.user) ? "premium" : "free",
      premiumPrice: null,
    });
  }

  try {
    const price = await stripe.prices.retrieve(priceId);
    if (!price.recurring) {
      return Response.json(
        { error: "STRIPE_PREMIUM_PRICE_ID must be a recurring Stripe price." },
        { status: 500 },
      );
    }

    return Response.json({
      plan: hasPremiumSubscription(result.session.user) ? "premium" : "free",
      premiumPrice: {
        amount: price.unit_amount,
        currency: price.currency,
        interval: price.recurring.interval,
      },
    });
  } catch {
    return Response.json(
      { error: "Could not load Premium pricing from Stripe." },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  const result = await getVendorSession();
  if ("error" in result) {
    return Response.json({ error: result.error }, { status: result.status });
  }
  if (hasPremiumSubscription(result.session.user)) {
    return Response.json(
      { error: "Your account already has Premium." },
      { status: 409 },
    );
  }

  const stripe = getStripe();
  const priceId = process.env.STRIPE_PREMIUM_PRICE_ID;
  if (!stripe || !priceId) {
    return Response.json(
      {
        error:
          "Stripe is not configured. Set STRIPE_SECRET_KEY and STRIPE_PREMIUM_PRICE_ID in the server environment.",
      },
      { status: 503 },
    );
  }

  try {
    const baseUrl = process.env.BETTER_AUTH_URL ?? new URL(request.url).origin;
    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: result.session.user.email,
      client_reference_id: result.session.user.id,
      metadata: {
        userId: result.session.user.id,
        userEmail: result.session.user.email,
      },
      subscription_data: {
        metadata: {
          userId: result.session.user.id,
          userEmail: result.session.user.email,
        },
      },
      success_url: new URL(
        "/dashboard/vendor/subscription?checkout=success",
        baseUrl,
      ).toString(),
      cancel_url: new URL(
        "/dashboard/vendor/subscription?checkout=cancelled",
        baseUrl,
      ).toString(),
    });

    if (!checkout.url) {
      return Response.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 502 },
      );
    }

    return Response.json({ url: checkout.url });
  } catch (error: unknown) {
    if (error instanceof Stripe.errors.StripeError) {
      return Response.json(
        { error: "Stripe could not start checkout. Check the server configuration." },
        { status: 502 },
      );
    }
    throw error;
  }
}
