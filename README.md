# Focus Writer Daily

A momentum-based draft-finishing companion that runs a 30-day first-draft program with daily micro-deliverables, guilt-free recalibration, and optional account sync + Stripe upgrades.

## Features

- **30-Day First Draft Program**: Structured writing tasks for 30 days
- **Anonymous-First**: Use immediately without signup, data stored locally
- **Momentum Tracking**: See your progress without streak pressure
- **Guilt-Free Recalibration**: Missed days? Auto-reschedule or add catch-up sprints
- **Quit-Risk Detection**: Get interventions before you fall off
- **Optional Account Sync**: Create account to sync across devices
- **Pro Upgrades**: Full history, multiple projects, advanced features (via Stripe)

## File Structure

```
focus-writer-daily/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Global styles
│   ├── app/                    # Main app routes
│   │   ├── layout.tsx          # App layout with nav
│   │   ├── page.tsx            # Today flow
│   │   ├── onboarding/page.tsx # Project setup
│   │   ├── plan/page.tsx       # Task list & recalibration
│   │   ├── progress/page.tsx   # Stats & history
│   │   └── account/page.tsx    # Settings & subscription
│   ├── login/page.tsx          # Login page
│   ├── signup/page.tsx         # Signup page
│   └── api/
│       ├── health/route.ts     # Health check endpoint
│       ├── auth/
│       │   └── migrate/route.ts # Migrate local data to Supabase
│       └── stripe/
│           ├── checkout/route.ts # Create checkout session
│           ├── portal/route.ts   # Billing portal
│           └── webhook/route.ts  # Stripe webhooks
├── components/
│   ├── Button.tsx              # Button component
│   ├── Input.tsx               # Input component
│   ├── Card.tsx                # Card component
│   ├── MoodSelector.tsx        # Mood (1-5) selector
│   ├── MomentumMeter.tsx       # Momentum display
│   ├── InterventionCard.tsx    # Risk intervention UI
│   ├── ClarityPrompt.tsx       # 60-second clarity questions
│   ├── CheckInForm.tsx         # Session check-in form
│   ├── NextStepLock.tsx        # Lock next session time
│   ├── SignupPrompt.tsx        # Soft signup prompt
│   ├── TaskList.tsx            # Task list display
│   ├── ProgressChart.tsx       # Activity chart
│   ├── Nav.tsx                 # Navigation
│   └── index.ts                # Exports
├── lib/
│   ├── env.ts                  # Environment variables & feature flags
│   ├── types.ts                # TypeScript types
│   ├── momentum.ts             # Momentum calculation & risk detection
│   ├── migrate.ts              # Client-side migration helper
│   ├── stripe.ts               # Stripe client
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client
│   │   └── server.ts           # Server Supabase client
│   ├── storage/
│   │   └── anon.ts             # localStorage management
│   └── programs/
│       └── 30day.ts            # 30-day program task generation
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── schema.sql                  # Database schema
├── rls.sql                     # Row Level Security policies
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── README.md
```

## Database Schema

### Tables

- **profiles**: User settings (timezone, preferred_minutes)
- **projects**: Writing projects (title, status, start_date, total_target_words)
- **tasks**: Daily tasks (day_index, due_date, title, target_words, kind, status)
- **sessions**: Writing sessions (clarity, completed, minutes, words, mood, planned_time)
- **subscriptions**: Stripe subscription data (stripe_customer_id, status, price_id, etc.)

All tables have RLS policies ensuring users can only access their own data.

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/health` | GET | Health check with service status |
| `/api/auth/migrate` | POST | Migrate localStorage data to Supabase |
| `/api/stripe/checkout` | POST | Create Stripe checkout session |
| `/api/stripe/portal` | POST | Create Stripe billing portal session |
| `/api/stripe/webhook` | POST | Handle Stripe webhook events |

## UI Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with value prop & pricing |
| `/app` | Today flow (clarity → check-in → next-step) |
| `/app/onboarding` | Create 30-day program |
| `/app/plan` | View tasks & recalibrate |
| `/app/progress` | Stats & session history |
| `/app/account` | Settings & subscription |
| `/login` | Email/password login |
| `/signup` | Email/password signup |

## Environment Variables

### Used from Shared Team Variables

| Variable | Type | Purpose |
|----------|------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Server-side Supabase admin |
| `STRIPE_SECRET_KEY` | Secret | Stripe API key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Secret | Stripe webhook signing secret |

### Project-Specific Variables

| Variable | Type | Purpose |
|----------|------|---------|
| `NEXT_PUBLIC_APP_URL` | Public | App URL (https://focus-writer-daily.vercel.app) |
| `NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID` | Public | Stripe monthly price ID |
| `NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID` | Public | Stripe yearly price ID |

## Local Anonymous Mode

The app works fully offline with localStorage:

1. No signup required to start
2. Data stored in browser localStorage
3. Full 30-day program works locally
4. After completing a session, soft prompt to create account
5. On signup/login, local data migrates to Supabase

## Feature Gating

| Feature | Free | Pro |
|---------|------|-----|
| 30-day program | ✓ | ✓ |
| Daily tasks | ✓ | ✓ |
| Momentum tracking | ✓ | ✓ |
| Basic recalibration | ✓ | ✓ |
| History | 14 days | Full |
| Projects | 1 | Unlimited |
| Advanced recalibration | - | ✓ |
| Integrations | - | ✓ (stub) |

## Setup

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### Database Setup

1. Create a Supabase project
2. Run the SQL in `schema.sql` and `rls.sql` in the SQL editor
3. Add environment variables

### Stripe Setup

1. Create Stripe products and prices
2. Set price IDs in environment variables
3. Configure webhook endpoint: `https://your-domain/api/stripe/webhook`
4. Set webhook secret in environment variables

## Deployment

```bash
# Build for production
npm run build

# Deploy to Vercel
npx vercel --prod
```

## License

MIT
