'use client';

import { useState } from 'react';
import type { Task } from '@/lib/types';
import Button from './Button';
import Input from './Input';
import MoodSelector from './MoodSelector';
import Card from './Card';

interface CheckInFormProps {
  task: Task;
  onSubmit: (data: {
    completed: boolean;
    minutes: number;
    words: number | null;
    mood: number | null;
  }) => void;
  onSkip: () => void;
}

export default function CheckInForm({ task, onSubmit, onSkip }: CheckInFormProps) {
  const [completed, setCompleted] = useState(true);
  const [minutes, setMinutes] = useState('25');
  const [words, setWords] = useState('');
  const [mood, setMood] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      completed,
      minutes: parseInt(minutes) || 0,
      words: words ? parseInt(words) : null,
      mood,
    });
  };

  return (
    <Card variant="elevated" className="max-w-lg mx-auto">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Check-in</h3>
      <p className="text-sm text-gray-600 mb-4">Task: {task.title}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setCompleted(true)}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
              completed
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            ✓ Completed
          </button>
          <button
            type="button"
            onClick={() => setCompleted(false)}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
              !completed
                ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            ↩ Partial
          </button>
        </div>

        <Input
          label="How many minutes did you write?"
          type="number"
          min="1"
          max="480"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          required
        />

        {task.targetWords && (
          <Input
            label={`Words written (target: ${task.targetWords})`}
            type="number"
            min="0"
            value={words}
            onChange={(e) => setWords(e.target.value)}
            placeholder="Optional"
          />
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How did the session feel?
          </label>
          <MoodSelector value={mood} onChange={setMood} />
        </div>

        <div className="flex justify-between pt-2">
          <Button type="button" variant="ghost" onClick={onSkip}>
            Skip
          </Button>
          <Button type="submit">
            Log Session
          </Button>
        </div>
      </form>
    </Card>
  );
}
