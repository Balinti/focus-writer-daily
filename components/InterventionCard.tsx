'use client';

import type { Intervention } from '@/lib/types';
import Button from './Button';
import Card from './Card';

interface InterventionCardProps {
  intervention: Intervention;
  onDismiss: () => void;
  onAction: () => void;
}

export default function InterventionCard({ intervention, onDismiss, onAction }: InterventionCardProps) {
  return (
    <Card variant="bordered" className="border-yellow-300 bg-yellow-50">
      <div className="flex items-start gap-3">
        <span className="text-2xl">💪</span>
        <div className="flex-1">
          <p className="font-medium text-gray-900 mb-1">{intervention.message}</p>
          <p className="text-sm text-gray-600 mb-4">{intervention.action}</p>
          <div className="flex gap-2">
            <Button size="sm" onClick={onAction}>
              {intervention.type === 'rescue-sprint' && 'Start 10-min Sprint'}
              {intervention.type === 'reduce-target' && 'Reduce Tomorrow\'s Target'}
              {intervention.type === 'reschedule' && 'Reschedule'}
            </Button>
            <Button size="sm" variant="ghost" onClick={onDismiss}>
              Maybe Later
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
