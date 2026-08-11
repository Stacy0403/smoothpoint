import { NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export async function POST(request: Request) {
  const { supabase, user } = await getAuthUser();
  if (!user) return unauthorized();

  if (!isStripeConfigured()) {
    // Dev mode: upgrade plan directly without Stripe
    const { error } = await supabase
      .from("profiles")
      .update({ plan_type: "pro" })
      .eq("id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await supabase.from("subscriptions").upsert(
      {
        user_id: user.id,
        status: "trialing",
        trial_end: new Date(Date.now() + 14 * 86400000).toISOString(),
        current_period_end: new Date(Date.now() + 14 * 86400000).toISOString(),
      },
      { onConflict: "user_id" }
    );

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    return NextResponse.json({
      url: `${appUrl}/dashboard/billing?success=1&dev=1`,
    });
  }

  const stripe = getStripe()!;
  const body = await request.json();
  const priceId =
    body.price_id ?? process.env.STRIPE_PRICE_PRO_MONTHLY;

  if (!priceId || priceId === "price_xxx") {
    return NextResponse.json(
      { error: "Stripe price not configured" },
      { status: 500 }
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", user.id)
    .single();

  const { data: existingSub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  let customerId = existingSub?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email ?? user.email,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;

    await supabase.from("subscriptions").upsert(
      {
        user_id: user.id,
        stripe_customer_id: customerId,
        status: "incomplete",
      },
      { onConflict: "user_id" }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: { trial_period_days: 14 },
    success_url: `${appUrl}/dashboard/billing?success=1`,
    cancel_url: `${appUrl}/dashboard/billing`,
    metadata: { supabase_user_id: user.id },
  });

  return NextResponse.json({ url: session.url });
}
