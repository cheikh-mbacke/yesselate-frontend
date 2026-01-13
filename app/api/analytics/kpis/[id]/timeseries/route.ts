import { NextResponse } from 'next/server';
import { analyticsMocks } from '@/lib/bmo/analytics/mocks';

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const params = await ctx.params;
  const url = new URL(req.url);
  const points = Number(url.searchParams.get('points') ?? '30');

  const series = analyticsMocks.getTimeseries(params.id, {
    points: Number.isFinite(points) ? Math.max(7, Math.min(points, 365)) : 30,
  });

  return NextResponse.json({ points: series });
}

