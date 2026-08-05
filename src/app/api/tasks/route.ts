import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const status = searchParams.get('status'); // 'today', 'upcoming', 'overdue'
    
    // Simplest approach: fetch all and filter in frontend for MVP, 
    // or we can sort by due_date
    const tasks = await prisma.task.findMany({
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
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('POST /api/tasks error:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
