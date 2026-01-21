'use client';

import Link from 'next/link';
import GoogleAuth from '@/components/GoogleAuth';
import { Card } from '@/components';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card variant="elevated" className="max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your Focus Writer Daily account</p>
        </div>

        <div className="flex justify-center mb-6">
          <GoogleAuth />
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
