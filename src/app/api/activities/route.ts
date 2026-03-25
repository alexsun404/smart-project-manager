import { NextRequest, NextResponse } from 'next/server';
import { activityStorage } from '@/storage/database';

export async function GET(request: NextRequest) {
  try { const { searchParams } = new URL(request.url); let activities = await activityStorage.getByProject(searchParams.get('projectId') || '');
    if (searchParams.get('limit')) activities = activities.slice(0, parseInt(searchParams.get('limit')!));
    return NextResponse.json({ data: activities });
  } catch (error) { return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 }); }
}
