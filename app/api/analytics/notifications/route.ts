import { NextResponse } from 'next/server';
import { analyticsMocks } from '@/lib/bmo/analytics/mocks';

export async function GET() {
  return NextResponse.json({ items: analyticsMocks.listNotifications() });
}

