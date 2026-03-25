import { NextRequest, NextResponse } from 'next/server';
import { taskStorage, activityStorage } from '@/storage/database';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const { id } = await params; const task = await taskStorage.getById(id); return task ? NextResponse.json({ data: task }) : NextResponse.json({ error: 'Task not found' }, { status: 404 }); }
  catch (error) { return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 }); }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; const body = await request.json();
    if (body.status === 'done') body.completed_at = new Date().toISOString();
    const task = await taskStorage.update(id, body);
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    await activityStorage.create({ project_id: task.project_id, type: 'task', title: `更新任务：${task.title}`, description: body.updateNote || null, user_id: null, user_name: '系统', metadata: null });
    return NextResponse.json({ data: task });
  } catch (error) { return NextResponse.json({ error: 'Failed to update task' }, { status: 500 }); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const { id } = await params; const task = await taskStorage.getById(id); if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 }); await taskStorage.delete(id); return NextResponse.json({ success: true }); }
  catch (error) { return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 }); }
}
