// Momentum scoring, risk detection, and interventions
import type { Task, Session, MomentumData, Intervention } from './types';

export function calculateMomentum(
  tasks: Task[],
  sessions: Session[]
): MomentumData {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  // Get tasks due up to today
  const dueTask = tasks.filter((t) => t.dueDate <= today);
  const completedTasks = dueTask.filter((t) => t.status === 'completed');
  const totalDueTasks = dueTask.length;

  // Calculate base score from completion rate
  const completionRate = totalDueTasks > 0
    ? completedTasks.length / totalDueTasks
    : 1;

  // Recent activity bonus (last 7 days)
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentSessions = sessions.filter(
    (s) => new Date(s.createdAt) >= sevenDaysAgo && s.completed
  );
  const recentActivityBonus = Math.min(recentSessions.length * 5, 20);

  // Calculate streak (internal, not shown to user)
  const streak = calculateStreak(tasks);

  // Base score calculation
  let score = Math.round(completionRate * 80) + recentActivityBonus;
  score = Math.min(100, Math.max(0, score));

  // Determine status
  let status: MomentumData['status'] = 'on-track';
  if (completionRate < 0.7) {
    status = 'behind';
  } else if (completionRate < 0.9) {
    status = 'slightly-behind';
  }

  // Check for quit risk
  const { riskLevel, intervention } = detectQuitRisk(tasks, sessions);

  return {
    score,
    status,
    completedTasks: completedTasks.length,
    totalTasks: tasks.length,
    streak,
    riskLevel,
    intervention,
  };
}

function calculateStreak(tasks: Task[]): number {
  const sortedTasks = [...tasks]
    .filter((t) => t.status === 'completed')
    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

  let streak = 0;
  const today = new Date();
  let checkDate = today;

  for (const task of sortedTasks) {
    const taskDate = new Date(task.dueDate);
    const diffDays = Math.floor(
      (checkDate.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays <= 1) {
      streak++;
      checkDate = taskDate;
    } else {
      break;
    }
  }

  return streak;
}

function detectQuitRisk(
  tasks: Task[],
  sessions: Session[]
): { riskLevel: MomentumData['riskLevel']; intervention: Intervention | null } {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Risk factors:
  // 1. Missed 2+ tasks in last 7 days
  const recentTasks = tasks.filter((t) => {
    const dueDate = new Date(t.dueDate);
    return dueDate >= sevenDaysAgo && dueDate <= now;
  });
  const missedRecent = recentTasks.filter(
    (t) => t.status === 'skipped' || (t.status === 'pending' && new Date(t.dueDate) < now)
  );

  // 2. Three sessions under 10 minutes
  const shortSessions = sessions.filter(
    (s) => s.completed && s.minutes < 10 && new Date(s.createdAt) >= sevenDaysAgo
  ).length;

  // 3. Planned time vs actual mismatch (3+ times)
  const timeMismatches = sessions.filter((s) => {
    if (!s.plannedTime || !s.completed) return false;
    // Check if actual session time differs significantly from planned
    // This is a simplified check - in reality you'd compare planned start time
    return s.minutes < 15; // Simplified: short sessions indicate possible time issues
  }).length;

  // Determine risk level
  let riskLevel: MomentumData['riskLevel'] = 'low';
  let intervention: Intervention | null = null;

  if (missedRecent.length >= 2) {
    riskLevel = 'high';
    intervention = {
      type: 'rescue-sprint',
      message: "Looks like you've missed a couple days. That's okay - let's do a quick rescue sprint!",
      action: 'Start a 10-minute mini session right now to rebuild momentum.',
    };
  } else if (shortSessions >= 3) {
    riskLevel = 'medium';
    intervention = {
      type: 'reduce-target',
      message: "Your recent sessions have been short. Let's adjust to match your current capacity.",
      action: 'Reduce tomorrow\'s target by 20% and schedule a specific time.',
    };
  } else if (timeMismatches >= 3) {
    riskLevel = 'medium';
    intervention = {
      type: 'reschedule',
      message: "There might be a mismatch between planned and actual writing times.",
      action: 'Let\'s find a better time slot that works with your schedule.',
    };
  }

  return { riskLevel, intervention };
}

// Get momentum status text for display
export function getMomentumStatusText(momentum: MomentumData): string {
  if (momentum.status === 'on-track') {
    return 'You\'re on track! Keep going.';
  } else if (momentum.status === 'slightly-behind') {
    return 'Slightly behind, but easily recoverable.';
  } else {
    return 'Behind schedule - let\'s recalibrate.';
  }
}

// Get momentum color class
export function getMomentumColor(momentum: MomentumData): string {
  if (momentum.score >= 70) return 'text-green-600';
  if (momentum.score >= 40) return 'text-yellow-600';
  return 'text-red-600';
}

// Get momentum background class
export function getMomentumBgColor(momentum: MomentumData): string {
  if (momentum.score >= 70) return 'bg-green-100';
  if (momentum.score >= 40) return 'bg-yellow-100';
  return 'bg-red-100';
}
