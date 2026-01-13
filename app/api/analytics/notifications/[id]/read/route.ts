import { NextResponse } from 'next/server';
import { analyticsMocks } from '@/lib/bmo/analytics/mocks';

export async function POST(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const params = await ctx.params;
  const updated = analyticsMocks.markNotificationRead(params.id);
  if (!updated) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  return NextResponse.json(updated);
}

