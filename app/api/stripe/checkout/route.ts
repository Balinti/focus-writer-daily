import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getStripe } from '@/lib/stripe';
import { env, features } from '@/lib/env';

export async function POST(request: NextRequest) {
  // Check if Stripe is configured
  if (!features.stripeEnabled) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 503 }
    );
  }

  if (!features.stripePricesConfigured) {
    return NextResponse.json(
      { error: 'No price IDs configured - upgrades unavailable' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { priceId } = body;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    // Verify price ID is valid
    const validPriceIds = [
      env.stripeProMonthlyPriceId,
      env.stripeProYearlyPriceId,
    ].filter(Boolean);

    if (!validPriceIds.includes(priceId)) {
      return NextResponse.json(
        { error: 'Invalid price ID' },
        { status: 400 }
      );
    }

    // Get user from Supabase auth
    let userId: string | null = null;
    let userEmail: string | null = null;

    if (features.supabaseEnabled) {
      const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        userId = user.id;
        userEmail = user.email || null;
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Please log in to upgrade' },
        { status: 401 }
      );
    }

    const stripe = getStripe();

    // Check if user already has a Stripe customer ID
    let stripeCustomerId: string | null = null;

    if (features.supabaseEnabled && env.supabaseServiceRoleKey) {
      const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey);
      const { data: subscription } = await supabaseAdmin
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .single();

      stripeCustomerId = subscription?.stripe_customer_id || null;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${env.appUrl}/app/account?success=true`,
      cancel_url: `${env.appUrl}/app/account?canceled=true`,
      customer: stripeCustomerId || undefined,
      customer_email: !stripeCustomerId ? userEmail || undefined : undefined,
      metadata: {
        app_name: 'focus-writer-daily',
        user_id: userId,
      },
      subscription_data: {
        metadata: {
          app_name: 'focus-writer-daily',
          user_id: userId,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
