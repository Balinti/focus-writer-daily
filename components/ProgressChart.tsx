'use client';

import type { Session } from '@/lib/types';

interface ProgressChartProps {
  sessions: Session[];
  daysToShow?: number;
}

export default function ProgressChart({ sessions, daysToShow = 14 }: ProgressChartProps) {
  // Group sessions by date
  const today = new Date();
  const days: Array<{
    date: string;
    dayLabel: string;
    minutes: number;
    words: number;
    completed: boolean;
  }> = [];

  for (let i = daysToShow - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const daySessions = sessions.filter(
      (s) => s.createdAt.split('T')[0] === dateStr && s.completed
    );

    const totalMinutes = daySessions.reduce((sum, s) => sum + s.minutes, 0);
    const totalWords = daySessions.reduce((sum, s) => sum + (s.words || 0), 0);

    days.push({
      date: dateStr,
      dayLabel: date.toLocaleDateString('en-US', { weekday: 'short' }),
      minutes: totalMinutes,
      words: totalWords,
      completed: daySessions.length > 0,
    });
  }

  const maxMinutes = Math.max(...days.map((d) => d.minutes), 60);

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <h3 className="text-sm font-medium text-gray-600 mb-4">Writing Activity</h3>

      <div className="flex items-end gap-1 h-32">
        {days.map((day) => {
          const height = day.minutes > 0 ? (day.minutes / maxMinutes) * 100 : 0;
          const isToday = day.date === today.toISOString().split('T')[0];

          return (
            <div key={day.date} className="flex-1 flex flex-col items-center">
              <div
                className={`w-full rounded-t transition-all ${
                  day.completed ? 'bg-blue-500' : 'bg-gray-200'
                } ${isToday ? 'ring-2 ring-blue-300' : ''}`}
                style={{ height: `${Math.max(height, 4)}%` }}
                title={`${day.minutes} min${day.words > 0 ? `, ${day.words} words` : ''}`}
              />
              <span className={`text-xs mt-1 ${isToday ? 'font-bold text-blue-600' : 'text-gray-400'}`}>
                {day.dayLabel.charAt(0)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex justify-between text-xs text-gray-500">
        <span>
          {sessions.filter((s) => s.completed).length} sessions
        </span>
        <span>
          {sessions.reduce((sum, s) => sum + s.minutes, 0)} total minutes
        </span>
      </div>
    </div>
  );
}
