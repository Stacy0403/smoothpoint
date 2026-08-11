import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

function subscriptionPeriodEnd(sub: Stripe.Subscription): string | null {
  const end =
    sub.items.data[0]?.current_period_end ??
    (sub as Stripe.Subscription & { current_period_end?: number })
      .current_period_end;
  return end ? new Date(end * 1000).toISOString() : null;
}

function subscriptionTrialEnd(sub: Stripe.Subscription): string | null {
  return sub.trial_end
    ? new Date(sub.trial_end * 1000).toISOString()
    : null;
}

export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ received: true, mode: "dev" });
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret || webhookSecret === "whsec_xxx") {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Admin client unavailable" }, { status: 500 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id;
      if (!userId) break;

      await admin.from("profiles").update({ plan_type: "pro" }).eq("id", userId);

      if (session.subscription && session.customer) {
        const sub = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
        await admin.from("subscriptions").upsert(
          {
            user_id: userId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: sub.id,
            status: sub.status as "active" | "trialing",
            price_id: sub.items.data[0]?.price.id ?? null,
            current_period_end: subscriptionPeriodEnd(sub),
            trial_end: subscriptionTrialEnd(sub),
          },
          { onConflict: "user_id" }
        );
      }
      break;
    }
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const { data: existing } = await admin
        .from("subscriptions")
        .select("user_id")
        .eq("stripe_subscription_id", sub.id)
        .maybeSingle();

      if (existing) {
        const isActive = sub.status === "active" || sub.status === "trialing";
        await admin
          .from("subscriptions")
          .update({
            status: sub.status as "active" | "trialing" | "past_due" | "canceled",
            current_period_end: subscriptionPeriodEnd(sub),
            trial_end: subscriptionTrialEnd(sub),
          })
          .eq("user_id", existing.user_id);

        await admin
          .from("profiles")
          .update({ plan_type: isActive ? "pro" : "free" })
          .eq("id", existing.user_id);
      }
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const { data: existing } = await admin
        .from("subscriptions")
        .select("user_id")
        .eq("stripe_subscription_id", sub.id)
        .maybeSingle();

      if (existing) {
        await admin
          .from("subscriptions")
          .update({ status: "canceled" })
          .eq("user_id", existing.user_id);
        await admin
          .from("profiles")
          .update({ plan_type: "free" })
          .eq("id", existing.user_id);
      }
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.customer) {
        await admin
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("stripe_customer_id", invoice.customer as string);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
