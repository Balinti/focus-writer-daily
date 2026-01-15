'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { hasLocalData, migrateToSupabase } from '@/lib/migrate';
import { Button, Input, Card } from '@/components';
import { clientFeatures } from '@/lib/env';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    if (!clientFeatures.supabaseEnabled || !supabase) {
      setError('Authentication is not configured');
      setIsLoading(false);
      return;
    }

    try {
      const { error: authError } = await supabase.auth.signUp({
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
          <h1 className="text-2xl font-bold mb-4 text-gray-900">Sign Up Unavailable</h1>
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
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600">Start your 30-day writing journey</p>
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
            autoComplete="new-password"
          />

          <Input
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" loading={isLoading}>
            Create Account
          </Button>
        </form>

        <p className="mt-4 text-xs text-gray-500 text-center">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Log in
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
