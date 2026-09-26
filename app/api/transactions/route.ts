import { NextResponse } from 'next/server';
import { transactions } from '@/lib/seed-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(transactions);
}
