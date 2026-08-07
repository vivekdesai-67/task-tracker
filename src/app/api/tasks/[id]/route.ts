import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);
    if (!session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask || existingTask.userId !== session.userId) {
      return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 404 });
    }

    let updateData = { ...body };
    if (body.due_date) updateData.due_date = new Date(body.due_date);
    if (body.start_date) updateData.start_date = new Date(body.start_date);
    else if (body.start_date === null) updateData.start_date = null;

    const task = await prisma.task.update({ where: { id }, data: updateData });
    return NextResponse.json(task);
  } catch (error) {
    console.error(`PATCH /api/tasks/[id] error:`, error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);
    if (!session.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask || existingTask.userId !== session.userId) {
      return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 404 });
    }

    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/tasks/[id] error:`, error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
