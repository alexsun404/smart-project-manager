import { NextRequest, NextResponse } from 'next/server';
import { milestoneStorage } from '@/storage/database';

export async function GET(request: NextRequest) {
  try { const { searchParams } = new URL(request.url); let milestones = await milestoneStorage.getAll();
    if (searchParams.get('projectId')) milestones = milestones.filter(m => m.project_id === searchParams.get('projectId'));
    return NextResponse.json({ data: milestones });
  } catch (error) { return NextResponse.json({ error: 'Failed to fetch milestones' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const milestone = await milestoneStorage.create({ project_id: body.project_id, title: body.title, description: body.description || null, status: body.status || 'pending', due_date: body.due_date || null, completed_at: null, progress: 0, metadata: body.metadata || null });
    return NextResponse.json({ data: milestone }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: 'Failed to create milestone' }, { status: 500 }); }
}
