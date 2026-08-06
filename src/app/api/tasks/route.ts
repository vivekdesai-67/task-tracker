import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tasks = await prisma.task.findMany({
      where: { userId: session.userId },
      orderBy: [
        { done: 'asc' },
        { due_date: 'asc' }
      ]
    });
    
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('GET /api/tasks error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, due_date, due_time, priority, tag, notes } = body;

    const task = await prisma.task.create({
      data: {
        title,
        due_date: new Date(due_date),
        due_time: due_time || null,
        priority: priority || 'med',
        tag: tag || null,
        notes: notes || '',
        userId: session.userId,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('POST /api/tasks error:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
