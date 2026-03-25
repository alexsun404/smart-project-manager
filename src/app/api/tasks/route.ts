import { NextRequest, NextResponse } from 'next/server';
import { taskStorage, activityStorage } from '@/storage/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let tasks = await taskStorage.getAll();
    if (searchParams.get('projectId')) tasks = tasks.filter(t => t.project_id === searchParams.get('projectId'));
    if (searchParams.get('status')) tasks = tasks.filter(t => t.status === searchParams.get('status'));
    if (searchParams.get('priority')) tasks = tasks.filter(t => t.priority === searchParams.get('priority'));
    return NextResponse.json({ data: tasks });
  } catch (error) { return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const task = await taskStorage.create({
      project_id: body.project_id, parent_id: body.parent_id || null, title: body.title, description: body.description || null,
      status: body.status || 'todo', priority: body.priority || 'medium', assignee_id: body.assignee_id || null,
      start_date: body.start_date || null, due_date: body.due_date || null, completed_at: null, estimated_hours: body.estimated_hours || null,
      actual_hours: body.actual_hours || null, tags: body.tags || [], attachments: body.attachments || [], metadata: body.metadata || null,
    });
    await activityStorage.create({ project_id: task.project_id, type: 'task', title: `创建任务：${task.title}`, description: task.description || null, user_id: null, user_name: '系统', metadata: null });
    return NextResponse.json({ data: task }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: 'Failed to create task' }, { status: 500 }); }
}
