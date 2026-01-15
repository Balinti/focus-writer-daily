'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getActiveProject,
  getTasks,
  getSessions,
} from '@/lib/storage/anon';
import { calculateMomentum } from '@/lib/momentum';
import type { Session, Task, MomentumData } from '@/lib/types';
import { Button, Card, MomentumMeter, ProgressChart } from '@/components';
import { clientFeatures } from '@/lib/env';

export default function ProgressPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [momentum, setMomentum] = useState<MomentumData | null>(null);
  const [projectTitle, setProjectTitle] = useState('');
  const [showPaywall, setShowPaywall] = useState(false);

  // In a real app, this would come from auth context
  const isPro = false;

  useEffect(() => {
    const project = getActiveProject();
    if (!project) {
      router.push('/app/onboarding');
      return;
    }

    setProjectTitle(project.title);

    const projectTasks = getTasks(project.id);
    const projectSessions = getSessions(project.id);

    setTasks(projectTasks);
    setSessions(projectSessions);
    setMomentum(calculateMomentum(projectTasks, projectSessions));
  }, [router]);

  // Calculate stats
  const totalMinutes = sessions.reduce((sum, s) => sum + s.minutes, 0);
  const totalWords = sessions.reduce((sum, s) => sum + (s.words || 0), 0);
  const completedSessions = sessions.filter((s) => s.completed).length;

  const avgMood =
    sessions.length > 0
      ? sessions.reduce((sum, s) => sum + (s.mood || 3), 0) / sessions.length
      : 0;

  // Filter sessions for free tier (14 days)
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const recentSessions = sessions.filter(
    (s) => new Date(s.createdAt) >= fourteenDaysAgo
  );

  const olderSessions = sessions.filter(
    (s) => new Date(s.createdAt) < fourteenDaysAgo
  );

  const handleViewFullHistory = () => {
    if (isPro) {
      // Show full history
    } else {
      setShowPaywall(true);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Progress</h1>
        <p className="text-gray-500">{projectTitle}</p>
      </div>

      {/* Momentum */}
      {momentum && <MomentumMeter momentum={momentum} />}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card variant="bordered">
          <p className="text-sm text-gray-500">Total Time</p>
          <p className="text-2xl font-bold text-gray-900">
            {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
          </p>
        </Card>
        <Card variant="bordered">
          <p className="text-sm text-gray-500">Sessions</p>
          <p className="text-2xl font-bold text-gray-900">{completedSessions}</p>
        </Card>
        {totalWords > 0 && (
          <Card variant="bordered">
            <p className="text-sm text-gray-500">Words Written</p>
            <p className="text-2xl font-bold text-gray-900">
              {totalWords.toLocaleString()}
            </p>
          </Card>
        )}
        <Card variant="bordered">
          <p className="text-sm text-gray-500">Avg. Mood</p>
          <p className="text-2xl font-bold text-gray-900">
            {avgMood > 0 ? avgMood.toFixed(1) : '-'}/5
          </p>
        </Card>
      </div>

      {/* Activity Chart */}
      <ProgressChart sessions={isPro ? sessions : recentSessions} daysToShow={14} />

      {/* Recent Sessions */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Recent Sessions</h2>
        {recentSessions.length === 0 ? (
          <Card variant="bordered" className="text-center py-8">
            <p className="text-gray-500">No sessions yet. Start writing!</p>
            <Button className="mt-4" onClick={() => router.push('/app')}>
              Go to Today
            </Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {recentSessions
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 10)
              .map((session) => {
                const task = tasks.find((t) => t.id === session.taskId);
                return (
                  <Card key={session.id} variant="bordered" className="py-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {task?.title || 'Writing session'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(session.createdAt).toLocaleDateString()} •{' '}
                          {session.minutes} min
                          {session.words ? ` • ${session.words} words` : ''}
                        </p>
                      </div>
                      {session.mood && (
                        <span className="text-lg">
                          {session.mood === 1 && '😫'}
                          {session.mood === 2 && '😕'}
                          {session.mood === 3 && '😐'}
                          {session.mood === 4 && '🙂'}
                          {session.mood === 5 && '😊'}
                        </span>
                      )}
                    </div>
                  </Card>
                );
              })}
          </div>
        )}
      </div>

      {/* Full History (Pro) */}
      {olderSessions.length > 0 && !isPro && (
        <Card variant="bordered" className="text-center py-6">
          <p className="text-gray-600 mb-2">
            You have {olderSessions.length} older{' '}
            {olderSessions.length === 1 ? 'session' : 'sessions'} beyond the 14-day limit.
          </p>
          <Button variant="secondary" onClick={handleViewFullHistory}>
            Upgrade to View Full History
          </Button>
        </Card>
      )}

      {/* Paywall Modal */}
      {showPaywall && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card variant="elevated" className="max-w-md w-full">
            <h3 className="text-xl font-bold mb-2 text-gray-900">
              Upgrade to Pro
            </h3>
            <p className="text-gray-600 mb-4">
              Access your full writing history, multiple projects, and advanced
              recalibration features.
            </p>
            <div className="space-y-3">
              {clientFeatures.stripePricesConfigured ? (
                <Link href="/account">
                  <Button className="w-full">See Pro Plans</Button>
                </Link>
              ) : (
                <p className="text-sm text-gray-500 text-center">
                  Upgrades not available at this time.
                </p>
              )}
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setShowPaywall(false)}
              >
                Maybe Later
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
