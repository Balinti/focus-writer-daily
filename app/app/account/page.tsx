'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { getSettings, updateSettings, clearLocalData } from '@/lib/storage/anon';
import { hasLocalData, migrateToSupabase } from '@/lib/migrate';
import type { UserSettings, Subscription } from '@/lib/types';
import { Button, Input, Card } from '@/components';
import { clientFeatures, clientEnv } from '@/lib/env';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [settings, setSettings] = useState<UserSettings>(getSettings());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationNeeded, setMigrationNeeded] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (!clientFeatures.supabaseEnabled || !supabase) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          setUser({ id: user.id, email: user.email || '' });

          // Check for local data that needs migration
          setMigrationNeeded(hasLocalData());

          // Fetch subscription
          const { data: sub } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (sub) {
            setSubscription(sub);
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      updateSettings(settings);
      // If logged in, also save to Supabase
      if (user && supabase) {
        await supabase
          .from('profiles')
          .update({
            timezone: settings.timezone,
            preferred_minutes: settings.preferredMinutes,
          })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMigrate = async () => {
    setIsMigrating(true);
    try {
      const result = await migrateToSupabase();
      if (result.success) {
        setMigrationNeeded(false);
      } else {
        console.error('Migration failed:', result.error);
      }
    } catch (error) {
      console.error('Migration error:', error);
    } finally {
      setIsMigrating(false);
    }
  };

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push('/');
  };

  const handleUpgrade = async (priceId: string) => {
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error starting checkout:', error);
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error opening billing portal:', error);
    }
  };

  const isPro = subscription?.status === 'active' || subscription?.status === 'trialing';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account</h1>
        <p className="text-gray-500">Manage your settings and subscription</p>
      </div>

      {/* Auth Status */}
      {!user ? (
        <Card variant="bordered" className="bg-blue-50 border-blue-200">
          <h3 className="font-semibold mb-2 text-gray-900">Save Your Progress</h3>
          <p className="text-sm text-gray-600 mb-4">
            Create an account to sync your writing across devices and never lose your work.
          </p>
          <div className="flex gap-3">
            <Link href="/signup">
              <Button>Create Account</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary">Log In</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Card variant="bordered">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Logged in as</p>
              <p className="font-medium text-gray-900">{user.email}</p>
            </div>
            <Button variant="ghost" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </Card>
      )}

      {/* Migration Prompt */}
      {user && migrationNeeded && (
        <Card variant="bordered" className="bg-yellow-50 border-yellow-200">
          <h3 className="font-semibold mb-2 text-gray-900">Sync Local Data</h3>
          <p className="text-sm text-gray-600 mb-4">
            You have writing data saved locally. Would you like to sync it to your account?
          </p>
          <Button onClick={handleMigrate} loading={isMigrating}>
            Sync Data Now
          </Button>
        </Card>
      )}

      {/* Subscription */}
      <Card variant="bordered">
        <h3 className="font-semibold mb-4 text-gray-900">Subscription</h3>
        {isPro ? (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                Pro
              </span>
              <span className="text-sm text-gray-600">
                {subscription?.cancelAtPeriodEnd
                  ? `Cancels ${new Date(subscription.currentPeriodEnd || '').toLocaleDateString()}`
                  : `Renews ${new Date(subscription?.currentPeriodEnd || '').toLocaleDateString()}`}
              </span>
            </div>
            <Button variant="secondary" onClick={handleManageBilling}>
              Manage Billing
            </Button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              You're on the free plan. Upgrade to Pro for unlimited history and more projects.
            </p>
            {clientFeatures.stripePricesConfigured ? (
              <div className="grid md:grid-cols-2 gap-4">
                {clientEnv.stripeProMonthlyPriceId && (
                  <button
                    onClick={() => handleUpgrade(clientEnv.stripeProMonthlyPriceId)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-all text-left"
                  >
                    <p className="font-semibold text-gray-900">Monthly</p>
                    <p className="text-2xl font-bold text-gray-900">$9/mo</p>
                  </button>
                )}
                {clientEnv.stripeProYearlyPriceId && (
                  <button
                    onClick={() => handleUpgrade(clientEnv.stripeProYearlyPriceId)}
                    className="p-4 border border-blue-500 rounded-lg bg-blue-50 hover:bg-blue-100 transition-all text-left relative"
                  >
                    <span className="absolute -top-2 right-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
                      Save 17%
                    </span>
                    <p className="font-semibold text-gray-900">Yearly</p>
                    <p className="text-2xl font-bold text-gray-900">$90/yr</p>
                  </button>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Upgrades are not available at this time.
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Settings */}
      <Card variant="bordered">
        <h3 className="font-semibold mb-4 text-gray-900">Settings</h3>
        <div className="space-y-4">
          <Input
            label="Timezone"
            type="text"
            value={settings.timezone}
            onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default session length
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[15, 25, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setSettings({ ...settings, preferredMinutes: mins })}
                  className={`py-2 px-3 rounded-lg border text-sm transition-all ${
                    settings.preferredMinutes === mins
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>
          <Button onClick={handleSaveSettings} loading={isSaving}>
            Save Settings
          </Button>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card variant="bordered" className="border-red-200">
        <h3 className="font-semibold mb-2 text-red-600">Danger Zone</h3>
        <p className="text-sm text-gray-600 mb-4">
          Clear all local data. This cannot be undone.
        </p>
        <Button
          variant="danger"
          onClick={() => {
            if (confirm('Are you sure? This will delete all your local writing data.')) {
              clearLocalData();
              router.push('/');
            }
          }}
        >
          Clear Local Data
        </Button>
      </Card>
    </div>
  );
}
