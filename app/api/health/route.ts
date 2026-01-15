import { NextResponse } from 'next/server';
import { features } from '@/lib/env';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      supabase: features.supabaseEnabled,
      stripe: features.stripeEnabled,
      stripePrices: features.stripePricesConfigured,
      webhookVerification: features.webhookVerificationEnabled,
    },
  });
}
