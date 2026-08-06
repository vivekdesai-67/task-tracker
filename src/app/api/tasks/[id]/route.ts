import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    
    // Ownership check
    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask || existingTask.userId !== session.userId) {
      return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 404 });
    }

    // Convert date string to Date object if due_date is provided
    let updateData = { ...body };
    if (body.due_date) {
      updateData.due_date = new Date(body.due_date);
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
    });
    
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
    const session = await getSession();
    if (!session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Ownership check
    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask || existingTask.userId !== session.userId) {
      return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 404 });
    }

    await prisma.task.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/tasks/[id] error:`, error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
