'use client';

import Link from 'next/link';
import { clientFeatures } from '@/lib/env';
import Button from '@/components/Button';
import Card from '@/components/Card';

export default function LandingPage() {
  const showPricing = clientFeatures.stripePricesConfigured;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <header className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <nav className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="font-bold text-xl">Focus Writer Daily</div>
          <div className="flex gap-4">
            <Link href="/login" className="text-white/80 hover:text-white transition-colors">
              Log in
            </Link>
            <Link href="/signup">
              <Button size="sm" variant="secondary">
                Sign up
              </Button>
            </Link>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Finish Your First Draft in 30 Days
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            A momentum-based writing companion with daily micro-tasks,
            guilt-free recalibration, and zero judgment. Start writing in under 3 minutes.
          </p>
          <Link href="/app">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Try it now - No signup required
            </Button>
          </Link>
          <p className="mt-4 text-sm text-white/70">
            Start anonymously • Save progress anytime • Free forever for basics
          </p>
        </div>
      </header>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card variant="bordered" className="text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">1. Quick Setup</h3>
              <p className="text-gray-600">
                Name your project, set your daily writing time, and let us generate
                your 30-day roadmap.
              </p>
            </Card>
            <Card variant="bordered" className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">2. Daily Focus</h3>
              <p className="text-gray-600">
                Each day: 60-second clarity prompt, write your task, log your progress.
                Simple and repeatable.
              </p>
            </Card>
            <Card variant="bordered" className="text-center">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">3. Guilt-Free Recalibration</h3>
              <p className="text-gray-600">
                Missed a day? No problem. Auto-reschedule, reduce targets,
                or do a quick catch-up sprint.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Built for Real Writers
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <span className="text-2xl">✅</span>
              <div>
                <h3 className="font-semibold mb-1 text-gray-900">Momentum, Not Streaks</h3>
                <p className="text-gray-600">
                  We show momentum scores, not streak counters. Missing a day doesn't reset everything.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="text-2xl">🎯</span>
              <div>
                <h3 className="font-semibold mb-1 text-gray-900">Micro-Deliverables</h3>
                <p className="text-gray-600">
                  Each day has a clear, achievable task. No vague "write 5000 words" goals.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="text-2xl">💪</span>
              <div>
                <h3 className="font-semibold mb-1 text-gray-900">Quit-Risk Detection</h3>
                <p className="text-gray-600">
                  We notice when you're struggling and offer concrete rescue options.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="text-2xl">🔓</span>
              <div>
                <h3 className="font-semibold mb-1 text-gray-900">Anonymous First</h3>
                <p className="text-gray-600">
                  Start writing immediately. Create an account later if you want to save across devices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      {showPricing && (
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">
              Simple Pricing
            </h2>
            <p className="text-center text-gray-600 mb-12">
              Start free, upgrade when you need more
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <Card variant="bordered">
                <h3 className="text-xl font-bold mb-2 text-gray-900">Free</h3>
                <p className="text-3xl font-bold text-gray-900 mb-4">$0</p>
                <ul className="space-y-2 text-gray-600 mb-6">
                  <li>✓ Full 30-day program</li>
                  <li>✓ Daily clarity prompts</li>
                  <li>✓ Momentum tracking</li>
                  <li>✓ Basic recalibration</li>
                  <li>✓ 14-day history</li>
                  <li>✓ 1 active project</li>
                </ul>
                <Link href="/app">
                  <Button variant="secondary" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </Card>
              <Card variant="bordered" className="border-blue-500 relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                  Popular
                </span>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Pro</h3>
                <p className="text-3xl font-bold text-gray-900 mb-4">
                  $9<span className="text-lg font-normal text-gray-500">/mo</span>
                </p>
                <ul className="space-y-2 text-gray-600 mb-6">
                  <li>✓ Everything in Free</li>
                  <li>✓ Unlimited history</li>
                  <li>✓ Multiple projects</li>
                  <li>✓ Advanced recalibration</li>
                  <li>✓ Export & integrations</li>
                  <li>✓ Priority support</li>
                </ul>
                <Link href="/signup">
                  <Button className="w-full">
                    Start Free Trial
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Finish That Draft?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of writers who've completed their first drafts with Focus Writer Daily.
          </p>
          <Link href="/app">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Start Writing Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="font-bold text-white text-lg mb-4">Focus Writer Daily</div>
          <p className="text-sm">
            Built for writers who want to ship, not just dream.
          </p>
          <p className="text-sm mt-4">
            © {new Date().getFullYear()} Focus Writer Daily. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
