import { NextRequest, NextResponse } from 'next/server';
import { projectStorage, activityStorage } from '@/storage/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let projects = await projectStorage.getAll();
    if (searchParams.get('status') && searchParams.get('status') !== 'all') projects = projects.filter(p => p.status === searchParams.get('status'));
    if (searchParams.get('priority') && searchParams.get('priority') !== 'all') projects = projects.filter(p => p.priority === searchParams.get('priority'));
    if (searchParams.get('search')) {
      const search = searchParams.get('search')!.toLowerCase();
      projects = projects.filter(p => p.name.toLowerCase().includes(search) || (p.description && p.description.toLowerCase().includes(search)));
    }
    return NextResponse.json({ data: projects });
  } catch (error) { return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const project = await projectStorage.create({
      name: body.name, description: body.description || null, status: body.status || 'planning',
      priority: body.priority || 'medium', start_date: body.start_date || null, end_date: body.end_date || null,
      progress: 0, budget: body.budget || null, tags: body.tags || [], metadata: body.metadata || null,
    });
    await activityStorage.create({ project_id: project.id, type: 'created', title: `创建项目：${project.name}`, description: project.description || null, user_id: null, user_name: '系统', metadata: null });
    return NextResponse.json({ data: project }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: 'Failed to create project' }, { status: 500 }); }
}
