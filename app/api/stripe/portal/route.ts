import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getStripe } from '@/lib/stripe';
import { env, features } from '@/lib/env';

export async function POST(request: NextRequest) {
  if (!features.stripeEnabled) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 503 }
    );
  }

  try {
    // Get user from Supabase auth
    let userId: string | null = null;

    if (features.supabaseEnabled) {
      const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        userId = user.id;
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Please log in to manage billing' },
        { status: 401 }
      );
    }

    // Get customer ID from subscription
    if (!env.supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: 'Service not available' },
        { status: 503 }
      );
    }

    const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey);
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (subError || !subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    const stripe = getStripe();

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${env.appUrl}/app/account`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Portal error:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
