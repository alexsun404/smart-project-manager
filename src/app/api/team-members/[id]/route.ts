import { NextRequest, NextResponse } from 'next/server';
import { teamMemberStorage } from '@/storage/database';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const { id } = await params; const member = await teamMemberStorage.getById(id); return member ? NextResponse.json({ data: member }) : NextResponse.json({ error: 'Member not found' }, { status: 404 }); }
  catch (error) { return NextResponse.json({ error: 'Failed to fetch team member' }, { status: 500 }); }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const { id } = await params; const body = await request.json(); const member = await teamMemberStorage.update(id, body); return member ? NextResponse.json({ data: member }) : NextResponse.json({ error: 'Member not found' }, { status: 404 }); }
  catch (error) { return NextResponse.json({ error: 'Failed to update team member' }, { status: 500 }); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const { id } = await params; const success = await teamMemberStorage.delete(id); return success ? NextResponse.json({ success: true }) : NextResponse.json({ error: 'Member not found' }, { status: 404 }); }
  catch (error) { return NextResponse.json({ error: 'Failed to delete team member' }, { status: 500 }); }
}
