import { NextRequest, NextResponse } from 'next/server';
import { getProjectAdvice, getTaskAdvice, getProgressAdvice } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json(); const { type } = body; let result: string;
    switch (type) {
      case 'project_advice': { const { name, description, priority } = body; result = await getProjectAdvice(name, description, priority); break; }
      case 'task_advice': { const { title, description, projectContext } = body; result = await getTaskAdvice(title, description, projectContext); break; }
      case 'progress_advice': { const { name, progress, tasks, daysRemaining } = body; result = await getProgressAdvice({ name, progress, tasks, daysRemaining }); break; }
      default: return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
    return NextResponse.json({ advice: result });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'AI service error' }, { status: 500 }); }
}
