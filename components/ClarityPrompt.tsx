'use client';

import { useState, useEffect } from 'react';
import { clarityQuestions } from '@/lib/programs/30day';
import type { ClarityResponse } from '@/lib/types';
import Button from './Button';
import Card from './Card';

interface ClarityPromptProps {
  onComplete: (response: ClarityResponse) => void;
  onSkip: () => void;
}

export default function ClarityPrompt({ onComplete, onSkip }: ClarityPromptProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [secondsLeft, setSecondsLeft] = useState(60);

  useEffect(() => {
    if (secondsLeft > 0) {
      const timer = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [secondsLeft]);

  const handleNext = () => {
    if (currentQuestion < clarityQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      onComplete({
        intention: answers.intention || '',
        blocker: answers.blocker || '',
        nextAction: answers.nextAction || '',
      });
    }
  };

  const question = clarityQuestions[currentQuestion];

  return (
    <Card variant="elevated" className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">60-Second Clarity</h3>
        <span className={`text-sm font-medium ${secondsLeft <= 10 ? 'text-red-600' : 'text-gray-500'}`}>
          {secondsLeft}s
        </span>
      </div>

      <div className="mb-4">
        <div className="flex gap-1 mb-4">
          {clarityQuestions.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded ${
                i <= currentQuestion ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <p className="text-gray-700 font-medium mb-3">{question.question}</p>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          rows={2}
          placeholder={question.placeholder}
          value={answers[question.id] || ''}
          onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
          autoFocus
        />
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onSkip}>
          Skip
        </Button>
        <Button onClick={handleNext}>
          {currentQuestion < clarityQuestions.length - 1 ? 'Next' : 'Start Writing'}
        </Button>
      </div>
    </Card>
  );
}
