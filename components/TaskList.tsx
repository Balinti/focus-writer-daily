'use client';

import type { Task } from '@/lib/types';

interface TaskListProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function getStatusColor(status: Task['status'], dueDate: string): string {
  const today = new Date().toISOString().split('T')[0];
  if (status === 'completed') return 'bg-green-100 text-green-800';
  if (status === 'skipped') return 'bg-gray-100 text-gray-800';
  if (dueDate === today) return 'bg-blue-100 text-blue-800';
  if (dueDate < today) return 'bg-red-100 text-red-800';
  return 'bg-gray-50 text-gray-600';
}

function getKindIcon(kind: Task['kind']): string {
  switch (kind) {
    case 'writing': return '✍️';
    case 'review': return '📖';
    case 'planning': return '📋';
    case 'catch-up': return '⚡';
    default: return '📝';
  }
}

export default function TaskList({ tasks, onTaskClick }: TaskListProps) {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-2">
      {tasks.map((task) => {
        const isToday = task.dueDate === today;
        const isPast = task.dueDate < today && task.status === 'pending';

        return (
          <div
            key={task.id}
            onClick={() => onTaskClick?.(task)}
            className={`p-4 rounded-lg border transition-all ${
              onTaskClick ? 'cursor-pointer hover:border-blue-300' : ''
            } ${isToday ? 'border-blue-500 shadow-sm' : 'border-gray-200'}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg">{getKindIcon(task.kind)}</span>
                <div>
                  <p className={`font-medium ${
                    task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'
                  }`}>
                    {task.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    Day {task.dayIndex + 1} • {formatDate(task.dueDate)}
                    {task.targetWords && ` • ${task.targetWords} words`}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status, task.dueDate)}`}>
                {isPast ? 'Overdue' : task.status}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
