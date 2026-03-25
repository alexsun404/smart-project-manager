import { NextRequest, NextResponse } from 'next/server';
import { commentStorage } from '@/storage/database';

export async function GET(request: NextRequest) {
  try { const { searchParams } = new URL(request.url); const taskId = searchParams.get('taskId');
    if (!taskId) return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
    const comments = await commentStorage.getByTask(taskId); return NextResponse.json({ data: comments });
  } catch (error) { return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const comment = await commentStorage.create({ task_id: body.task_id, user_id: body.user_id || 'system', user_name: body.user_name || '系统', content: body.content, parent_id: body.parent_id || null, attachments: body.attachments || [] });
    return NextResponse.json({ data: comment }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 }); }
}
