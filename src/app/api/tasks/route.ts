import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';

export async function GET(request: Request) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);
    if (!session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const tasks = await prisma.task.findMany({
      where: { userId: session.userId },
      orderBy: [{ done: 'asc' }, { due_date: 'asc' }]
    });
    return NextResponse.json(tasks);
  } catch (error: any) {
    console.error('GET /api/tasks error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks', details: error?.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);
    if (!session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { title, is_meeting, start_date, due_date, due_time, priority, tag, notes } = body;

    const task = await prisma.task.create({
      data: {
        title,
        is_meeting: is_meeting || false,
        start_date: start_date ? new Date(start_date) : null,
        due_date: new Date(due_date),
        due_time: due_time || null,
        priority: priority || 'med',
        tag: tag || null,
        notes: notes || '',
        userId: session.userId,
      },
    });

    return NextResponse.json(task);
  } catch (error: any) {
    console.error('POST /api/tasks error:', error);
    return NextResponse.json({ error: 'Failed to create task', details: error?.message }, { status: 500 });
  }
}
