'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveProject, saveTasks, updateSettings } from '@/lib/storage/anon';
import { generateTasks } from '@/lib/programs/30day';
import type { Project, OnboardingData } from '@/lib/types';
import { Button, Input, Card } from '@/components';

type Step = 'title' | 'words' | 'schedule' | 'confirm';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('title');
  const [isLoading, setIsLoading] = useState(false);

  const [data, setData] = useState<OnboardingData>({
    projectTitle: '',
    totalTargetWords: null,
    startDate: new Date().toISOString().split('T')[0],
    daysPerWeek: 7,
    preferredSessionLength: 25,
  });

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      // Create project
      const project: Project = {
        id: crypto.randomUUID(),
        title: data.projectTitle,
        status: 'active',
        startDate: data.startDate,
        totalTargetWords: data.totalTargetWords,
        createdAt: new Date().toISOString(),
      };

      // Generate tasks
      const tasks = generateTasks(project.id, data);

      // Save to localStorage
      saveProject(project);
      saveTasks(tasks);
      updateSettings({
        preferredMinutes: data.preferredSessionLength,
        daysPerWeek: data.daysPerWeek,
      });

      // Navigate to main app
      router.push('/app');
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Set Up Your 30-Day Program
        </h1>
        <p className="text-gray-600">
          Let's create a personalized writing plan for you.
        </p>
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {(['title', 'words', 'schedule', 'confirm'] as Step[]).map((s, i) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded ${
              (['title', 'words', 'schedule', 'confirm'] as Step[]).indexOf(step) >= i
                ? 'bg-blue-500'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Title Step */}
      {step === 'title' && (
        <Card variant="elevated">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">
            What are you writing?
          </h2>
          <Input
            label="Project Title"
            value={data.projectTitle}
            onChange={(e) => updateData({ projectTitle: e.target.value })}
            placeholder="e.g., My First Novel, Blog Series, Memoir..."
            autoFocus
          />
          <p className="text-sm text-gray-500 mt-2">
            This helps you stay focused on one project for 30 days.
          </p>
          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => setStep('words')}
              disabled={!data.projectTitle.trim()}
            >
              Next
            </Button>
          </div>
        </Card>
      )}

      {/* Words Step */}
      {step === 'words' && (
        <Card variant="elevated">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">
            Word count goal (optional)
          </h2>
          <Input
            label="Total words for the draft"
            type="number"
            value={data.totalTargetWords?.toString() || ''}
            onChange={(e) =>
              updateData({
                totalTargetWords: e.target.value ? parseInt(e.target.value) : null,
              })
            }
            placeholder="e.g., 50000"
          />
          <p className="text-sm text-gray-500 mt-2">
            Leave empty to focus on completing tasks instead of word counts.
            We'll set daily micro-deliverables either way.
          </p>
          <div className="mt-6 flex justify-between">
            <Button variant="ghost" onClick={() => setStep('title')}>
              Back
            </Button>
            <Button onClick={() => setStep('schedule')}>Next</Button>
          </div>
        </Card>
      )}

      {/* Schedule Step */}
      {step === 'schedule' && (
        <Card variant="elevated">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">
            Your writing schedule
          </h2>

          <div className="space-y-4">
            <Input
              label="Start date"
              type="date"
              value={data.startDate}
              onChange={(e) => updateData({ startDate: e.target.value })}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Days per week
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 6, 7].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => updateData({ daysPerWeek: days })}
                    className={`py-2 px-3 rounded-lg border text-sm transition-all ${
                      data.daysPerWeek === days
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {days} days
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session length
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[15, 25, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => updateData({ preferredSessionLength: mins })}
                    className={`py-2 px-3 rounded-lg border text-sm transition-all ${
                      data.preferredSessionLength === mins
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {mins} min
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <Button variant="ghost" onClick={() => setStep('words')}>
              Back
            </Button>
            <Button onClick={() => setStep('confirm')}>Next</Button>
          </div>
        </Card>
      )}

      {/* Confirm Step */}
      {step === 'confirm' && (
        <Card variant="elevated">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">
            Ready to start?
          </h2>

          <div className="space-y-3 mb-6 bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Project</span>
              <span className="font-medium text-gray-900">{data.projectTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duration</span>
              <span className="font-medium text-gray-900">30 days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Start date</span>
              <span className="font-medium text-gray-900">
                {new Date(data.startDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Schedule</span>
              <span className="font-medium text-gray-900">
                {data.daysPerWeek} days/week, {data.preferredSessionLength} min/session
              </span>
            </div>
            {data.totalTargetWords && (
              <div className="flex justify-between">
                <span className="text-gray-600">Word goal</span>
                <span className="font-medium text-gray-900">
                  {data.totalTargetWords.toLocaleString()} words
                </span>
              </div>
            )}
          </div>

          <p className="text-sm text-gray-500 mb-6">
            We'll generate 30 daily tasks tailored to your schedule.
            You can always recalibrate later if life gets in the way.
          </p>

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep('schedule')}>
              Back
            </Button>
            <Button onClick={handleSubmit} loading={isLoading}>
              Create Program
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
