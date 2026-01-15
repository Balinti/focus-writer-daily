'use client';

import { useState, useEffect } from 'react';
import type { Task } from '@/lib/types';
import Button from './Button';
import Card from './Card';

interface NextStepLockProps {
  nextTask: Task | null;
  onLock: (plannedTime: string) => void;
  onSkip: () => void;
}

export default function NextStepLock({ nextTask, onLock, onSkip }: NextStepLockProps) {
  const [plannedTime, setPlannedTime] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(30);

  useEffect(() => {
    if (secondsLeft > 0) {
      const timer = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [secondsLeft]);

  // Default to tomorrow at 9am if no task
  const suggestedTimes = ['08:00', '09:00', '10:00', '14:00', '19:00', '21:00'];

  if (!nextTask) {
    return (
      <Card variant="elevated" className="max-w-lg mx-auto text-center">
        <span className="text-4xl mb-4 block">🎉</span>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          You've completed all tasks!
        </h3>
        <p className="text-gray-600 mb-4">
          Amazing work finishing your 30-day program!
        </p>
        <Button onClick={onSkip}>View Progress</Button>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Lock Your Next Session</h3>
        <span className={`text-sm font-medium ${secondsLeft <= 10 ? 'text-red-600' : 'text-gray-500'}`}>
          {secondsLeft}s
        </span>
      </div>

      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 mb-1">Tomorrow's task:</p>
        <p className="font-medium text-gray-900">{nextTask.title}</p>
        {nextTask.targetWords && (
          <p className="text-sm text-gray-500 mt-1">Target: {nextTask.targetWords} words</p>
        )}
      </div>

      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">When will you write?</p>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {suggestedTimes.map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => setPlannedTime(time)}
              className={`py-2 px-3 rounded-lg border text-sm transition-all ${
                plannedTime === time
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {time}
            </button>
          ))}
        </div>
        <input
          type="time"
          value={plannedTime}
          onChange={(e) => setPlannedTime(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onSkip}>
          Skip
        </Button>
        <Button onClick={() => onLock(plannedTime)} disabled={!plannedTime}>
          Lock It In
        </Button>
      </div>
    </Card>
  );
}
