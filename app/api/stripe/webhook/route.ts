import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { env, features } from '@/lib/env';

// Disable body parsing to get raw body for signature verification
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // Always return 200 to acknowledge receipt
  // Even if processing fails, we don't want Stripe to retry indefinitely

  if (!features.stripeEnabled) {
    console.log('Webhook received but Stripe not configured');
    return NextResponse.json({ received: true, status: 'stripe_not_configured' });
  }

  try {
    const rawBody = await request.text();
    const signature = request.headers.get('stripe-signature');

    let event: Stripe.Event;

    // Verify signature if webhook secret is configured
    if (features.webhookVerificationEnabled && signature) {
      try {
        const stripe = new Stripe(env.stripeSecretKey, {
          apiVersion: '2023-10-16',
        });
        event = stripe.webhooks.constructEvent(
          rawBody,
          signature,
          env.stripeWebhookSecret
        );
      } catch (err) {
        console.error('Webhook signature verification failed:', err);
        // Return 200 anyway to prevent retries, but log the error
        return NextResponse.json({ received: true, status: 'signature_invalid' });
      }
    } else {
      // No signature verification - parse event directly
      // This is less secure but allows testing without webhook secret
      try {
        event = JSON.parse(rawBody) as Stripe.Event;
      } catch (err) {
        console.error('Failed to parse webhook body:', err);
        return NextResponse.json({ received: true, status: 'parse_error' });
      }
    }

    // Check if Supabase is configured for storing subscription data
    if (!features.supabaseEnabled || !env.supabaseServiceRoleKey) {
      console.log('Webhook received but Supabase not configured for storage');
      return NextResponse.json({ received: true, status: 'db_not_configured' });
    }

    const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Handle relevant events
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Check if this is for our app
        if (session.metadata?.app_name !== 'focus-writer-daily') {
          console.log('Webhook for different app, ignoring');
          return NextResponse.json({ received: true, status: 'different_app' });
        }

        const userId = session.metadata?.user_id;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!userId) {
          console.error('No user_id in checkout session metadata');
          return NextResponse.json({ received: true, status: 'no_user_id' });
        }

        // Get subscription details
        const stripe = new Stripe(env.stripeSecretKey, { apiVersion: '2023-10-16' });
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        await supabaseAdmin.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          status: subscription.status,
          price_id: subscription.items.data[0]?.price.id || null,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

        console.log(`Subscription created for user ${userId}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        // Find user by customer ID
        const { data: existingSub } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (!existingSub) {
          // Try finding by customer ID
          const { data: byCustomer } = await supabaseAdmin
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_customer_id', subscription.customer as string)
            .single();

          if (!byCustomer) {
            console.log('No matching subscription found for update');
            return NextResponse.json({ received: true, status: 'no_matching_sub' });
          }

          await supabaseAdmin.from('subscriptions').update({
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            price_id: subscription.items.data[0]?.price.id || null,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          }).eq('user_id', byCustomer.user_id);
        } else {
          await supabaseAdmin.from('subscriptions').update({
            status: subscription.status,
            price_id: subscription.items.data[0]?.price.id || null,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          }).eq('user_id', existingSub.user_id);
        }

        console.log(`Subscription updated: ${subscription.id}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        // Find and update user's subscription to free
        const { data: existingSub } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (existingSub) {
          await supabaseAdmin.from('subscriptions').update({
            status: 'free',
            stripe_subscription_id: null,
            price_id: null,
            current_period_end: null,
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          }).eq('user_id', existingSub.user_id);

          console.log(`Subscription deleted for user ${existingSub.user_id}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true, status: 'processed' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Always return 200 to prevent Stripe from retrying
    return NextResponse.json({ received: true, status: 'error' });
  }
}
