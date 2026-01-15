// Client-side migration helper for moving localStorage data to Supabase
import { getDataForMigration, clearLocalData } from './storage/anon';

export interface MigrationPayload {
  projects: Array<{
    id: string;
    title: string;
    status: string;
    startDate: string;
    totalTargetWords: number | null;
    createdAt: string;
  }>;
  tasks: Array<{
    id: string;
    projectId: string;
    dayIndex: number;
    dueDate: string;
    title: string;
    targetWords: number | null;
    kind: string;
    status: string;
    createdAt: string;
  }>;
  sessions: Array<{
    id: string;
    projectId: string;
    taskId: string | null;
    clarity: object | null;
    completed: boolean;
    minutes: number;
    words: number | null;
    mood: number | null;
    plannedTime: string | null;
    createdAt: string;
  }>;
}

export function prepareMigrationPayload(): MigrationPayload {
  const data = getDataForMigration();
  return {
    projects: data.projects.map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      startDate: p.startDate,
      totalTargetWords: p.totalTargetWords,
      createdAt: p.createdAt,
    })),
    tasks: data.tasks.map((t) => ({
      id: t.id,
      projectId: t.projectId,
      dayIndex: t.dayIndex,
      dueDate: t.dueDate,
      title: t.title,
      targetWords: t.targetWords,
      kind: t.kind,
      status: t.status,
      createdAt: t.createdAt,
    })),
    sessions: data.sessions.map((s) => ({
      id: s.id,
      projectId: s.projectId,
      taskId: s.taskId,
      clarity: s.clarity,
      completed: s.completed,
      minutes: s.minutes,
      words: s.words,
      mood: s.mood,
      plannedTime: s.plannedTime,
      createdAt: s.createdAt,
    })),
  };
}

export async function migrateToSupabase(): Promise<{ success: boolean; error?: string }> {
  const payload = prepareMigrationPayload();

  // Skip if no data to migrate
  if (payload.projects.length === 0 && payload.tasks.length === 0 && payload.sessions.length === 0) {
    return { success: true };
  }

  try {
    const response = await fetch('/api/auth/migrate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Migration failed' };
    }

    // Clear local data after successful migration
    clearLocalData();

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Migration failed'
    };
  }
}

export function hasLocalData(): boolean {
  const data = getDataForMigration();
  return data.projects.length > 0 || data.tasks.length > 0 || data.sessions.length > 0;
}
