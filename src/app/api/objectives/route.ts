import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: objectives, error } = await supabase
      .from('objectives')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ objectives });
  } catch (error) {
    console.error('Error fetching objectives:', error);
    return NextResponse.json(
      { error: 'Failed to fetch objectives' },
      { status: 500 }
    );
  }
} 