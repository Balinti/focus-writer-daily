import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env, features } from '@/lib/env';
import { z } from 'zod';

const migrationSchema = z.object({
  projects: z.array(
    z.object({
      id: z.string().uuid(),
      title: z.string(),
      status: z.string(),
      startDate: z.string(),
      totalTargetWords: z.number().nullable(),
      createdAt: z.string(),
    })
  ),
  tasks: z.array(
    z.object({
      id: z.string().uuid(),
      projectId: z.string().uuid(),
      dayIndex: z.number(),
      dueDate: z.string(),
      title: z.string(),
      targetWords: z.number().nullable(),
      kind: z.string(),
      status: z.string(),
      createdAt: z.string(),
    })
  ),
  sessions: z.array(
    z.object({
      id: z.string().uuid(),
      projectId: z.string().uuid(),
      taskId: z.string().uuid().nullable(),
      clarity: z.any().nullable(),
      completed: z.boolean(),
      minutes: z.number(),
      words: z.number().nullable(),
      mood: z.number().nullable(),
      plannedTime: z.string().nullable(),
      createdAt: z.string(),
    })
  ),
});

export async function POST(request: NextRequest) {
  if (!features.supabaseEnabled || !env.supabaseServiceRoleKey) {
    return NextResponse.json(
      { error: 'Migration not available - Supabase not configured' },
      { status: 503 }
    );
  }

  try {
    // Get auth token from request
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || '';

    // Create client with user's token for auth verification
    const supabaseAuth = createClient(env.supabaseUrl, env.supabaseAnonKey);
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);

    // Also try to get session from cookies
    let userId: string | null = null;

    if (user) {
      userId = user.id;
    } else {
      // Try cookie-based auth
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        const { data: { session } } = await supabaseAuth.auth.getSession();
        if (session?.user) {
          userId = session.user.id;
        }
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = migrationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid data format', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { projects, tasks, sessions } = validationResult.data;

    // Use service role for admin operations
    const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Migrate projects (upsert to avoid duplicates)
    if (projects.length > 0) {
      const projectsToInsert = projects.map((p) => ({
        id: p.id,
        user_id: userId,
        title: p.title,
        status: p.status,
        start_date: p.startDate,
        total_target_words: p.totalTargetWords,
        created_at: p.createdAt,
      }));

      const { error: projectsError } = await supabaseAdmin
        .from('projects')
        .upsert(projectsToInsert, { onConflict: 'id' });

      if (projectsError) {
        console.error('Projects migration error:', projectsError);
        return NextResponse.json(
          { error: 'Failed to migrate projects' },
          { status: 500 }
        );
      }
    }

    // Migrate tasks (upsert to avoid duplicates)
    if (tasks.length > 0) {
      const tasksToInsert = tasks.map((t) => ({
        id: t.id,
        project_id: t.projectId,
        user_id: userId,
        day_index: t.dayIndex,
        due_date: t.dueDate,
        title: t.title,
        target_words: t.targetWords,
        kind: t.kind,
        status: t.status,
        created_at: t.createdAt,
      }));

      const { error: tasksError } = await supabaseAdmin
        .from('tasks')
        .upsert(tasksToInsert, { onConflict: 'id' });

      if (tasksError) {
        console.error('Tasks migration error:', tasksError);
        return NextResponse.json(
          { error: 'Failed to migrate tasks' },
          { status: 500 }
        );
      }
    }

    // Migrate sessions (upsert to avoid duplicates)
    if (sessions.length > 0) {
      const sessionsToInsert = sessions.map((s) => ({
        id: s.id,
        project_id: s.projectId,
        task_id: s.taskId,
        user_id: userId,
        clarity: s.clarity,
        completed: s.completed,
        minutes: s.minutes,
        words: s.words,
        mood: s.mood,
        planned_time: s.plannedTime,
        created_at: s.createdAt,
      }));

      const { error: sessionsError } = await supabaseAdmin
        .from('sessions')
        .upsert(sessionsToInsert, { onConflict: 'id' });

      if (sessionsError) {
        console.error('Sessions migration error:', sessionsError);
        return NextResponse.json(
          { error: 'Failed to migrate sessions' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      migrated: {
        projects: projects.length,
        tasks: tasks.length,
        sessions: sessions.length,
      },
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Migration failed' },
      { status: 500 }
    );
  }
}
