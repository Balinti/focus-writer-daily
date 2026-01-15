'use client';

import { getMomentumColor, getMomentumStatusText } from '@/lib/momentum';
import type { MomentumData } from '@/lib/types';

interface MomentumMeterProps {
  momentum: MomentumData;
}

export default function MomentumMeter({ momentum }: MomentumMeterProps) {
  const colorClass = getMomentumColor(momentum);
  const statusText = getMomentumStatusText(momentum);

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">Momentum</span>
        <span className={`text-2xl font-bold ${colorClass}`}>{momentum.score}</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${
            momentum.score >= 70 ? 'bg-green-500' : momentum.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${momentum.score}%` }}
        />
      </div>

      <p className="text-sm text-gray-600">{statusText}</p>

      <div className="mt-3 flex justify-between text-xs text-gray-500">
        <span>{momentum.completedTasks} of {momentum.totalTasks} tasks done</span>
        <span className={`font-medium ${
          momentum.status === 'on-track' ? 'text-green-600' :
          momentum.status === 'slightly-behind' ? 'text-yellow-600' : 'text-red-600'
        }`}>
          {momentum.status === 'on-track' ? 'On Track' :
           momentum.status === 'slightly-behind' ? 'Slightly Behind' : 'Behind'}
        </span>
      </div>
    </div>
  );
}
