'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getActiveProject,
  getTodayTask,
  getTasks,
  getSessions,
  saveSession,
  updateTask,
  hasCompletedSession,
  hasSeenSignupPrompt,
  markSignupPromptSeen,
} from '@/lib/storage/anon';
import { calculateMomentum } from '@/lib/momentum';
import type { Task, Session, ClarityResponse, MomentumData } from '@/lib/types';
import {
  Card,
  Button,
  ClarityPrompt,
  CheckInForm,
  NextStepLock,
  MomentumMeter,
  InterventionCard,
  SignupPrompt,
} from '@/components';
import { clientFeatures } from '@/lib/env';

type FlowStep = 'loading' | 'no-project' | 'clarity' | 'checkin' | 'next-step' | 'done' | 'signup-prompt';

export default function TodayPage() {
  const router = useRouter();
  const [step, setStep] = useState<FlowStep>('loading');
  const [todayTask, setTodayTask] = useState<Task | null>(null);
  const [nextTask, setNextTask] = useState<Task | null>(null);
  const [momentum, setMomentum] = useState<MomentumData | null>(null);
  const [clarity, setClarity] = useState<ClarityResponse | null>(null);
  const [showIntervention, setShowIntervention] = useState(true);

  useEffect(() => {
    const project = getActiveProject();

    if (!project) {
      setStep('no-project');
      return;
    }

    const tasks = getTasks(project.id);
    const sessions = getSessions(project.id);
    const today = getTodayTask(project.id);

    setTodayTask(today || null);
    setMomentum(calculateMomentum(tasks, sessions));

    // Find next task after today
    const todayDate = new Date().toISOString().split('T')[0];
    const futureTasks = tasks
      .filter((t) => t.dueDate > todayDate && t.status === 'pending')
      .sort((a, b) => a.dayIndex - b.dayIndex);
    setNextTask(futureTasks[0] || null);

    // Determine starting step
    if (!today) {
      setStep('done');
    } else {
      setStep('clarity');
    }
  }, []);

  const handleClarityComplete = (response: ClarityResponse) => {
    setClarity(response);
    setStep('checkin');
  };

  const handleCheckInSubmit = (data: {
    completed: boolean;
    minutes: number;
    words: number | null;
    mood: number | null;
  }) => {
    if (!todayTask) return;

    const project = getActiveProject();
    if (!project) return;

    // Create session
    const session: Session = {
      id: crypto.randomUUID(),
      projectId: project.id,
      taskId: todayTask.id,
      clarity,
      completed: data.completed,
      minutes: data.minutes,
      words: data.words,
      mood: data.mood,
      plannedTime: null,
      createdAt: new Date().toISOString(),
    };

    saveSession(session);

    // Update task status
    if (data.completed) {
      updateTask({ ...todayTask, status: 'completed' });
    }

    // Check if we should show signup prompt
    const completedBefore = hasCompletedSession();
    const seenPrompt = hasSeenSignupPrompt();

    if (!completedBefore && !seenPrompt && clientFeatures.supabaseEnabled) {
      setStep('signup-prompt');
    } else {
      setStep('next-step');
    }
  };

  const handleNextStepLock = (plannedTime: string) => {
    if (!nextTask) return;

    // We could store planned time, but for now just show completion
    setStep('done');
  };

  const handleSignupPromptDismiss = () => {
    markSignupPromptSeen();
    setStep('next-step');
  };

  const handleInterventionAction = () => {
    if (!momentum?.intervention) return;

    if (momentum.intervention.type === 'rescue-sprint') {
      // Start a quick 10-min session
      setStep('clarity');
    } else if (momentum.intervention.type === 'reduce-target') {
      router.push('/app/plan');
    } else {
      router.push('/app/plan');
    }
  };

  if (step === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your day...</p>
        </div>
      </div>
    );
  }

  if (step === 'no-project') {
    return (
      <div className="text-center py-12">
        <span className="text-6xl mb-6 block">✍️</span>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome to Focus Writer Daily
        </h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Let's set up your 30-day first draft program. It only takes a minute.
        </p>
        <Button onClick={() => router.push('/app/onboarding')} size="lg">
          Start Your Program
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Today</h1>
          <p className="text-gray-500">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Momentum */}
      {momentum && <MomentumMeter momentum={momentum} />}

      {/* Intervention */}
      {momentum?.intervention && showIntervention && step !== 'signup-prompt' && (
        <InterventionCard
          intervention={momentum.intervention}
          onDismiss={() => setShowIntervention(false)}
          onAction={handleInterventionAction}
        />
      )}

      {/* Today's Task */}
      {todayTask && step !== 'done' && step !== 'signup-prompt' && (
        <Card variant="bordered" className="mb-6">
          <p className="text-sm text-gray-500 mb-1">Today's Task</p>
          <p className="font-semibold text-gray-900">{todayTask.title}</p>
          {todayTask.targetWords && (
            <p className="text-sm text-gray-600 mt-1">
              Target: {todayTask.targetWords} words
            </p>
          )}
        </Card>
      )}

      {/* Flow Steps */}
      {step === 'clarity' && (
        <ClarityPrompt
          onComplete={handleClarityComplete}
          onSkip={() => setStep('checkin')}
        />
      )}

      {step === 'checkin' && todayTask && (
        <CheckInForm
          task={todayTask}
          onSubmit={handleCheckInSubmit}
          onSkip={() => setStep('next-step')}
        />
      )}

      {step === 'signup-prompt' && (
        <SignupPrompt onDismiss={handleSignupPromptDismiss} />
      )}

      {step === 'next-step' && (
        <NextStepLock
          nextTask={nextTask}
          onLock={handleNextStepLock}
          onSkip={() => setStep('done')}
        />
      )}

      {step === 'done' && (
        <Card variant="elevated" className="text-center py-8">
          <span className="text-4xl mb-4 block">🎉</span>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {todayTask ? "Great work today!" : "All caught up!"}
          </h2>
          <p className="text-gray-600 mb-6">
            {todayTask
              ? "You've completed today's session. Come back tomorrow!"
              : "Check out your plan for upcoming tasks."}
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="secondary" onClick={() => router.push('/app/plan')}>
              View Plan
            </Button>
            <Button onClick={() => router.push('/app/progress')}>
              See Progress
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
