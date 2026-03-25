import { NextRequest, NextResponse } from 'next/server';
import { projectStorage, taskStorage, deliverableStorage, teamMemberStorage, activityStorage } from '@/storage/database';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const { id } = await params; const project = await projectStorage.getById(id); return project ? NextResponse.json({ data: project }) : NextResponse.json({ error: 'Project not found' }, { status: 404 }); }
  catch (error) { return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 }); }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; const body = await request.json();
    const project = await projectStorage.update(id, body);
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    await activityStorage.create({ project_id: project.id, type: 'updated', title: `更新项目：${project.name}`, description: body.updateNote || null, user_id: null, user_name: '系统', metadata: null });
    return NextResponse.json({ data: project });
  } catch (error) { return NextResponse.json({ error: 'Failed to update project' }, { status: 500 }); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const tasks = await taskStorage.getByProject(id); for (const task of tasks) await taskStorage.delete(task.id);
    const deliverables = await deliverableStorage.getByProject(id); for (const del of deliverables) await deliverableStorage.delete(del.id);
    const members = await teamMemberStorage.getByProject(id); for (const member of members) await teamMemberStorage.delete(member.id);
    const success = await projectStorage.delete(id);
    return success ? NextResponse.json({ success: true }) : NextResponse.json({ error: 'Project not found' }, { status: 404 });
  } catch (error) { return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 }); }
}
