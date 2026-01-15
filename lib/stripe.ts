import Stripe from 'stripe';
import { env, features } from './env';

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!features.stripeEnabled) {
    throw new Error('Stripe is not configured');
  }
  if (!stripeInstance) {
    stripeInstance = new Stripe(env.stripeSecretKey, {
      apiVersion: '2023-10-16',
      typescript: true,
    });
  }
  return stripeInstance;
}

export function isStripeConfigured(): boolean {
  return features.stripeEnabled && features.stripePricesConfigured;
}
