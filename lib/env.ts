// Environment variable access with feature flags
// Server-only secrets: STRIPE_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY, PERPLEXITY_API_KEY, GOOGLE_API_KEY
// Client-exposed allowed: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

export const env = {
  // Supabase
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  stripeProMonthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || '',
  stripeProYearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID || '',

  // App
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://focus-writer-daily.vercel.app',
};

// Feature flags based on env availability
export const features = {
  supabaseEnabled: !!(env.supabaseUrl && env.supabaseAnonKey),
  stripeEnabled: !!(env.stripeSecretKey && env.stripePublishableKey),
  stripePricesConfigured: !!(env.stripeProMonthlyPriceId || env.stripeProYearlyPriceId),
  webhookVerificationEnabled: !!env.stripeWebhookSecret,
};

// For client-side use
export const clientEnv = {
  supabaseUrl: env.supabaseUrl,
  supabaseAnonKey: env.supabaseAnonKey,
  stripePublishableKey: env.stripePublishableKey,
  stripeProMonthlyPriceId: env.stripeProMonthlyPriceId,
  stripeProYearlyPriceId: env.stripeProYearlyPriceId,
  appUrl: env.appUrl,
};

export const clientFeatures = {
  supabaseEnabled: !!(clientEnv.supabaseUrl && clientEnv.supabaseAnonKey),
  stripeEnabled: !!clientEnv.stripePublishableKey,
  stripePricesConfigured: !!(clientEnv.stripeProMonthlyPriceId || clientEnv.stripeProYearlyPriceId),
};
