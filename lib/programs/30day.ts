// 30-day First Draft program task generation
import type { Task, OnboardingData } from '../types';

function generateId(): string {
  return crypto.randomUUID();
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Task templates for different phases
const taskTemplates = [
  // Week 1: Foundation & Momentum Building
  { title: 'Establish your writing space and ritual', kind: 'planning' as const },
  { title: 'Write your opening hook/first page', kind: 'writing' as const },
  { title: 'Introduce your main character or premise', kind: 'writing' as const },
  { title: 'Set the stakes early', kind: 'writing' as const },
  { title: 'Build the world/context', kind: 'writing' as const },
  { title: 'End the first scene with a question', kind: 'writing' as const },
  { title: 'Quick review: Does the opening grab?', kind: 'review' as const },

  // Week 2: Deepening
  { title: 'Introduce the first conflict or obstacle', kind: 'writing' as const },
  { title: 'Deepen character motivation', kind: 'writing' as const },
  { title: 'Add sensory details to a key scene', kind: 'writing' as const },
  { title: 'Write a pivotal conversation', kind: 'writing' as const },
  { title: 'Raise the stakes', kind: 'writing' as const },
  { title: 'Plant a seed for later', kind: 'writing' as const },
  { title: 'Mid-point check: Is the story moving?', kind: 'review' as const },

  // Week 3: Tension & Turning Points
  { title: 'Introduce a twist or reveal', kind: 'writing' as const },
  { title: 'Deepen the central conflict', kind: 'writing' as const },
  { title: 'Write a moment of doubt or failure', kind: 'writing' as const },
  { title: 'Show character growth or change', kind: 'writing' as const },
  { title: 'Add a subplot beat', kind: 'writing' as const },
  { title: 'Build toward the climax', kind: 'writing' as const },
  { title: 'Pacing check: Too fast or too slow?', kind: 'review' as const },

  // Week 4: Climax & Resolution
  { title: 'Set up the final confrontation', kind: 'writing' as const },
  { title: 'Write the climax - part 1', kind: 'writing' as const },
  { title: 'Write the climax - part 2', kind: 'writing' as const },
  { title: 'Show the aftermath', kind: 'writing' as const },
  { title: 'Tie up loose ends', kind: 'writing' as const },
  { title: 'Write the final scene/ending', kind: 'writing' as const },
  { title: 'Draft complete! Quick celebration review', kind: 'review' as const },

  // Days 29-30: Buffer & Polish
  { title: 'Fill any gaps or weak spots', kind: 'writing' as const },
  { title: 'Read through and note big fixes for revision', kind: 'review' as const },
];

export function generateTasks(
  projectId: string,
  onboarding: OnboardingData
): Task[] {
  const startDate = new Date(onboarding.startDate);
  const totalDays = 30;
  const daysPerWeek = onboarding.daysPerWeek;

  // Calculate word targets per day if total target provided
  const wordsPerDay = onboarding.totalTargetWords
    ? Math.ceil(onboarding.totalTargetWords / totalDays)
    : null;

  const tasks: Task[] = [];
  let currentDate = startDate;
  let dayIndex = 0;
  let taskIndex = 0;

  while (taskIndex < totalDays) {
    // Check if this is a writing day based on daysPerWeek
    const dayOfWeek = currentDate.getDay();
    const isWritingDay = isActiveDay(dayIndex, daysPerWeek);

    if (isWritingDay && taskIndex < taskTemplates.length) {
      const template = taskTemplates[taskIndex];
      tasks.push({
        id: generateId(),
        projectId,
        dayIndex: taskIndex,
        dueDate: currentDate.toISOString().split('T')[0],
        title: template.title,
        targetWords: template.kind === 'writing' ? wordsPerDay : null,
        kind: template.kind,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
      taskIndex++;
    }

    currentDate = addDays(currentDate, 1);
    dayIndex++;
  }

  return tasks;
}

function isActiveDay(dayIndex: number, daysPerWeek: number): boolean {
  if (daysPerWeek >= 7) return true;
  if (daysPerWeek === 6) return dayIndex % 7 !== 0; // Skip Sundays
  if (daysPerWeek === 5) return dayIndex % 7 !== 0 && dayIndex % 7 !== 6; // Skip weekends
  // For fewer days, distribute evenly
  const interval = Math.floor(7 / daysPerWeek);
  return dayIndex % interval === 0;
}

// Reschedule remaining tasks after missed days
export function rescheduleTasks(
  tasks: Task[],
  missedTaskIds: string[],
  reduceTargets: boolean = true
): Task[] {
  const today = new Date().toISOString().split('T')[0];

  // Find tasks that need rescheduling
  const pendingTasks = tasks
    .filter((t) => t.status === 'pending' && !missedTaskIds.includes(t.id))
    .sort((a, b) => a.dayIndex - b.dayIndex);

  // Mark missed tasks
  const updatedTasks = tasks.map((t) => {
    if (missedTaskIds.includes(t.id)) {
      return { ...t, status: 'skipped' as const };
    }
    return t;
  });

  // Reschedule remaining tasks
  let currentDate = new Date(today);
  const rescheduledTasks = updatedTasks.map((task) => {
    if (task.status !== 'pending') return task;

    const newDueDate = currentDate.toISOString().split('T')[0];
    currentDate = addDays(currentDate, 1);

    // Optionally reduce target words
    const newTargetWords =
      reduceTargets && task.targetWords
        ? Math.ceil(task.targetWords * 0.8)
        : task.targetWords;

    return {
      ...task,
      dueDate: newDueDate,
      targetWords: newTargetWords,
    };
  });

  return rescheduledTasks;
}

// Insert a catch-up sprint task
export function insertCatchUpSprint(
  tasks: Task[],
  projectId: string,
  afterTaskId: string
): Task[] {
  const afterTask = tasks.find((t) => t.id === afterTaskId);
  if (!afterTask) return tasks;

  const catchUpTask: Task = {
    id: generateId(),
    projectId,
    dayIndex: afterTask.dayIndex + 0.5,
    dueDate: afterTask.dueDate,
    title: '10-minute catch-up sprint',
    targetWords: null,
    kind: 'catch-up',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  // Insert after the specified task
  const index = tasks.findIndex((t) => t.id === afterTaskId);
  const newTasks = [...tasks];
  newTasks.splice(index + 1, 0, catchUpTask);

  return newTasks;
}

// Clarity questions for the 60-second prompt
export const clarityQuestions = [
  {
    id: 'intention',
    question: "What's the ONE thing you want to accomplish in this session?",
    placeholder: "e.g., Write the opening scene, finish chapter 2...",
  },
  {
    id: 'blocker',
    question: "What might get in your way right now?",
    placeholder: "e.g., Distracted, unclear on plot, tired...",
  },
  {
    id: 'nextAction',
    question: "What's your very first action when you start?",
    placeholder: "e.g., Open document, re-read last paragraph...",
  },
];
