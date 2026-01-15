'use client';

import Link from 'next/link';
import Button from './Button';
import Card from './Card';

interface SignupPromptProps {
  onDismiss: () => void;
}

export default function SignupPrompt({ onDismiss }: SignupPromptProps) {
  return (
    <Card variant="elevated" className="max-w-md mx-auto border-2 border-blue-100">
      <div className="text-center">
        <span className="text-4xl mb-3 block">💾</span>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Save Your Progress
        </h3>
        <p className="text-gray-600 mb-4">
          Create a free account to save your writing progress across devices
          and never lose your work.
        </p>

        <div className="space-y-3">
          <Link href="/signup" className="block">
            <Button className="w-full">
              Create Free Account
            </Button>
          </Link>
          <Link href="/login" className="block">
            <Button variant="secondary" className="w-full">
              I Have an Account
            </Button>
          </Link>
          <Button variant="ghost" className="w-full" onClick={onDismiss}>
            Continue Without Account
          </Button>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Your local data will be preserved and can be synced later.
        </p>
      </div>
    </Card>
  );
}
