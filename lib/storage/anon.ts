// Anonymous localStorage management
import type { LocalStorageData, Project, Task, Session, UserSettings } from '../types';

const STORAGE_KEY = 'focus-writer-daily';

const defaultSettings: UserSettings = {
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  preferredMinutes: 25,
  daysPerWeek: 7,
};

const defaultData: LocalStorageData = {
  projects: [],
  tasks: [],
  sessions: [],
  settings: defaultSettings,
  activeProjectId: null,
  hasCompletedSession: false,
  hasSeenSignupPrompt: false,
};

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getLocalData(): LocalStorageData {
  if (!isBrowser()) {
    return defaultData;
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return defaultData;
    }
    return { ...defaultData, ...JSON.parse(stored) };
  } catch {
    return defaultData;
  }
}

export function setLocalData(data: LocalStorageData): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export function clearLocalData(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEY);
}

// Project helpers
export function getProjects(): Project[] {
  return getLocalData().projects;
}

export function getProject(id: string): Project | undefined {
  return getProjects().find((p) => p.id === id);
}

export function getActiveProject(): Project | undefined {
  const data = getLocalData();
  if (!data.activeProjectId) return data.projects[0];
  return data.projects.find((p) => p.id === data.activeProjectId);
}

export function setActiveProject(projectId: string): void {
  const data = getLocalData();
  data.activeProjectId = projectId;
  setLocalData(data);
}

export function saveProject(project: Project): void {
  const data = getLocalData();
  const index = data.projects.findIndex((p) => p.id === project.id);
  if (index >= 0) {
    data.projects[index] = project;
  } else {
    data.projects.push(project);
  }
  if (!data.activeProjectId) {
    data.activeProjectId = project.id;
  }
  setLocalData(data);
}

// Task helpers
export function getTasks(projectId?: string): Task[] {
  const tasks = getLocalData().tasks;
  if (projectId) {
    return tasks.filter((t) => t.projectId === projectId);
  }
  return tasks;
}

export function getTask(id: string): Task | undefined {
  return getTasks().find((t) => t.id === id);
}

export function getTodayTask(projectId: string): Task | undefined {
  const today = new Date().toISOString().split('T')[0];
  const tasks = getTasks(projectId);
  // Find task due today or the next pending task
  const todayTask = tasks.find((t) => t.dueDate === today && t.status === 'pending');
  if (todayTask) return todayTask;
  // Find the first pending task
  return tasks.find((t) => t.status === 'pending');
}

export function saveTasks(tasks: Task[]): void {
  const data = getLocalData();
  // Replace or add tasks
  for (const task of tasks) {
    const index = data.tasks.findIndex((t) => t.id === task.id);
    if (index >= 0) {
      data.tasks[index] = task;
    } else {
      data.tasks.push(task);
    }
  }
  setLocalData(data);
}

export function updateTask(task: Task): void {
  saveTasks([task]);
}

// Session helpers
export function getSessions(projectId?: string): Session[] {
  const sessions = getLocalData().sessions;
  if (projectId) {
    return sessions.filter((s) => s.projectId === projectId);
  }
  return sessions;
}

export function saveSession(session: Session): void {
  const data = getLocalData();
  const index = data.sessions.findIndex((s) => s.id === session.id);
  if (index >= 0) {
    data.sessions[index] = session;
  } else {
    data.sessions.push(session);
  }
  if (session.completed) {
    data.hasCompletedSession = true;
  }
  setLocalData(data);
}

// Settings helpers
export function getSettings(): UserSettings {
  return getLocalData().settings;
}

export function updateSettings(settings: Partial<UserSettings>): void {
  const data = getLocalData();
  data.settings = { ...data.settings, ...settings };
  setLocalData(data);
}

// Status helpers
export function hasCompletedSession(): boolean {
  return getLocalData().hasCompletedSession;
}

export function markSignupPromptSeen(): void {
  const data = getLocalData();
  data.hasSeenSignupPrompt = true;
  setLocalData(data);
}

export function hasSeenSignupPrompt(): boolean {
  return getLocalData().hasSeenSignupPrompt;
}

// Migration helper
export function getDataForMigration(): {
  projects: Project[];
  tasks: Task[];
  sessions: Session[];
} {
  const data = getLocalData();
  return {
    projects: data.projects,
    tasks: data.tasks,
    sessions: data.sessions,
  };
}
