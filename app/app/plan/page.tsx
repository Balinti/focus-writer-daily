'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getActiveProject,
  getTasks,
  saveTasks,
} from '@/lib/storage/anon';
import { rescheduleTasks, insertCatchUpSprint } from '@/lib/programs/30day';
import type { Task } from '@/lib/types';
import { Button, Card, TaskList } from '@/components';

export default function PlanPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectTitle, setProjectTitle] = useState('');
  const [showRecalibrate, setShowRecalibrate] = useState(false);
  const [isRecalibrating, setIsRecalibrating] = useState(false);

  useEffect(() => {
    const project = getActiveProject();
    if (!project) {
      router.push('/app/onboarding');
      return;
    }

    setProjectTitle(project.title);
    const projectTasks = getTasks(project.id);
    setTasks(projectTasks.sort((a, b) => a.dayIndex - b.dayIndex));
  }, [router]);

  const today = new Date().toISOString().split('T')[0];

  // Find missed tasks
  const missedTasks = tasks.filter(
    (t) => t.dueDate < today && t.status === 'pending'
  );

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleRecalibrate = (reduceTargets: boolean = true) => {
    setIsRecalibrating(true);

    try {
      const missedIds = missedTasks.map((t) => t.id);
      const newTasks = rescheduleTasks(tasks, missedIds, reduceTargets);

      saveTasks(newTasks);
      setTasks(newTasks.sort((a, b) => a.dayIndex - b.dayIndex));
      setShowRecalibrate(false);
    } catch (error) {
      console.error('Error recalibrating:', error);
    } finally {
      setIsRecalibrating(false);
    }
  };

  const handleAddCatchUp = () => {
    const project = getActiveProject();
    if (!project) return;

    // Find the next pending task
    const nextPending = tasks.find((t) => t.status === 'pending');
    if (!nextPending) return;

    const newTasks = insertCatchUpSprint(tasks, project.id, nextPending.id);
    saveTasks(newTasks);
    setTasks(newTasks.sort((a, b) => a.dayIndex - b.dayIndex));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Plan</h1>
          <p className="text-gray-500">{projectTitle}</p>
        </div>
      </div>

      {/* Progress Summary */}
      <Card variant="bordered">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Overall Progress</span>
          <span className="text-sm font-medium text-gray-900">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <div
            className="h-2 rounded-full bg-blue-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600">
          {completedCount} of {totalCount} tasks completed
        </p>
      </Card>

      {/* Missed Days Warning */}
      {missedTasks.length > 0 && (
        <Card variant="bordered" className="border-yellow-300 bg-yellow-50">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <p className="font-medium text-gray-900 mb-1">
                {missedTasks.length} missed {missedTasks.length === 1 ? 'task' : 'tasks'}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                No worries! You can reschedule your remaining tasks or add a catch-up sprint.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" onClick={() => setShowRecalibrate(true)}>
                  Recalibrate Plan
                </Button>
                <Button size="sm" variant="secondary" onClick={handleAddCatchUp}>
                  Add Catch-up Sprint
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Recalibrate Modal */}
      {showRecalibrate && (
        <Card variant="elevated" className="border-2 border-blue-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Recalibrate Your Plan</h3>
          <p className="text-gray-600 mb-4">
            Choose how you want to handle the {missedTasks.length} missed{' '}
            {missedTasks.length === 1 ? 'task' : 'tasks'}:
          </p>
          <div className="space-y-3">
            <button
              onClick={() => handleRecalibrate(true)}
              disabled={isRecalibrating}
              className="w-full p-4 text-left rounded-lg border border-gray-200 hover:border-blue-300 transition-all"
            >
              <p className="font-medium text-gray-900">Shift & Reduce</p>
              <p className="text-sm text-gray-600">
                Move remaining tasks forward and reduce word targets by 20%
              </p>
            </button>
            <button
              onClick={() => handleRecalibrate(false)}
              disabled={isRecalibrating}
              className="w-full p-4 text-left rounded-lg border border-gray-200 hover:border-blue-300 transition-all"
            >
              <p className="font-medium text-gray-900">Shift Only</p>
              <p className="text-sm text-gray-600">
                Move remaining tasks forward but keep original targets
              </p>
            </button>
          </div>
          <Button
            variant="ghost"
            className="mt-4"
            onClick={() => setShowRecalibrate(false)}
          >
            Cancel
          </Button>
        </Card>
      )}

      {/* Task List */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-gray-900">All Tasks</h2>
        <TaskList tasks={tasks} />
      </div>
    </div>
  );
}
