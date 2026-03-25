import { NextRequest, NextResponse } from 'next/server';
import { teamMemberStorage } from '@/storage/database';

export async function GET(request: NextRequest) {
  try { const { searchParams } = new URL(request.url); let members = await teamMemberStorage.getAll();
    if (searchParams.get('projectId')) members = members.filter(m => m.project_id === searchParams.get('projectId'));
    return NextResponse.json({ data: members });
  } catch (error) { return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const member = await teamMemberStorage.create({ user_id: body.user_id, project_id: body.project_id, role: body.role || 'member', name: body.name, email: body.email, avatar: body.avatar || null, department: body.department || null, position: body.position || null, permissions: body.permissions || [], is_active: true, joined_at: new Date().toISOString() });
    return NextResponse.json({ data: member }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: 'Failed to create team member' }, { status: 500 }); }
}
