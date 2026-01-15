// Core types for the application

export interface Project {
  id: string;
  userId?: string;
  title: string;
  status: 'active' | 'completed' | 'archived';
  startDate: string; // ISO date string
  totalTargetWords: number | null;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  userId?: string;
  dayIndex: number;
  dueDate: string; // ISO date string
  title: string;
  targetWords: number | null;
  kind: 'writing' | 'review' | 'planning' | 'catch-up';
  status: 'pending' | 'completed' | 'skipped' | 'rescheduled';
  createdAt: string;
}

export interface Session {
  id: string;
  projectId: string;
  taskId: string | null;
  userId?: string;
  clarity: ClarityResponse | null;
  completed: boolean;
  minutes: number;
  words: number | null;
  mood: number | null; // 1-5
  plannedTime: string | null; // HH:MM format
  createdAt: string;
}

export interface ClarityResponse {
  intention: string;
  blocker: string;
  nextAction: string;
}

export interface UserSettings {
  timezone: string;
  preferredMinutes: number;
  daysPerWeek: number;
}

export interface OnboardingData {
  projectTitle: string;
  totalTargetWords: number | null;
  startDate: string;
  daysPerWeek: number;
  preferredSessionLength: number;
}

export interface Subscription {
  id: string;
  userId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  status: 'active' | 'trialing' | 'canceled' | 'past_due' | 'incomplete' | 'incomplete_expired' | 'unpaid' | 'paused' | 'free';
  priceId: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  updatedAt: string;
}

export interface MomentumData {
  score: number; // 0-100
  status: 'on-track' | 'slightly-behind' | 'behind';
  completedTasks: number;
  totalTasks: number;
  streak: number; // Internal only, not shown to user
  riskLevel: 'low' | 'medium' | 'high';
  intervention: Intervention | null;
}

export interface Intervention {
  type: 'rescue-sprint' | 'reduce-target' | 'reschedule';
  message: string;
  action: string;
}

export interface LocalStorageData {
  projects: Project[];
  tasks: Task[];
  sessions: Session[];
  settings: UserSettings;
  activeProjectId: string | null;
  hasCompletedSession: boolean;
  hasSeenSignupPrompt: boolean;
}
