import { NextRequest, NextResponse } from 'next/server';
import { deliverableStorage } from '@/storage/database';

export async function GET(request: NextRequest) {
  try { const { searchParams } = new URL(request.url); let deliverables = await deliverableStorage.getAll();
    if (searchParams.get('projectId')) deliverables = deliverables.filter(d => d.project_id === searchParams.get('projectId'));
    return NextResponse.json({ data: deliverables });
  } catch (error) { return NextResponse.json({ error: 'Failed to fetch deliverables' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const deliverable = await deliverableStorage.create({ project_id: body.project_id, milestone_id: body.milestone_id || null, task_id: body.task_id || null, title: body.title, description: body.description || null, type: body.type || '其他文件', file_url: body.file_url || null, file_name: body.file_name || null, file_size: body.file_size || null, tags: body.tags || [], version: body.version || null, metadata: body.metadata || null });
    return NextResponse.json({ data: deliverable }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: 'Failed to create deliverable' }, { status: 500 }); }
}
