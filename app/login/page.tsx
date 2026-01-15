'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { hasLocalData, migrateToSupabase } from '@/lib/migrate';
import { Button, Input, Card } from '@/components';
import { clientFeatures } from '@/lib/env';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!clientFeatures.supabaseEnabled || !supabase) {
      setError('Authentication is not configured');
      setIsLoading(false);
      return;
    }

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setIsLoading(false);
        return;
      }

      // Check if there's local data to migrate
      if (hasLocalData()) {
        await migrateToSupabase();
      }

      router.push('/app');
    } catch (err) {
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  if (!clientFeatures.supabaseEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card variant="elevated" className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">Login Unavailable</h1>
          <p className="text-gray-600 mb-4">
            Authentication is not configured. You can still use the app anonymously.
          </p>
          <Link href="/app">
            <Button>Continue to App</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card variant="elevated" className="max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600">Log in to your Focus Writer Daily account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" loading={isLoading}>
            Log In
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </div>

        <div className="mt-4 text-center">
          <Link href="/app" className="text-sm text-gray-500 hover:underline">
            Continue without account
          </Link>
        </div>
      </Card>
    </div>
  );
}
