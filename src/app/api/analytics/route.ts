import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ error: 'خدمة الإحصائيات معطلة حالياً' }, { status: 400 });
}