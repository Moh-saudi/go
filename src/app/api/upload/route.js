import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // جلب التوكن من الهيدر
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'مفقود رمز المصادقة' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');

    // تهيئة supabase client مع التوكن
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: {
          headers: { Authorization: `Bearer ${token}` }
        }
      }
    );

    // جلب المستخدم من التوكن
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: 'المستخدم غير مصادق' }, { status: 401 });
    }

    // جلب الملف من الطلب
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file) {
      return NextResponse.json({ error: 'لم يتم إرسال ملف' }, { status: 400 });
    }

    // التحقق من نوع الملف
    if (file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'رفع الصور معطل مؤقتاً' }, { status: 400 });
    }

    // التحقق من أن الملف هو فيديو
    if (!file.type.startsWith('video/')) {
      return NextResponse.json({ error: 'نوع الملف غير مسموح به' }, { status: 400 });
    }

    // بناء المسار الصحيح
    const filePath = `${user.id}/videos/${Date.now()}-${file.name}`;

    // رفع الملف إلى Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from('player-files')
      .upload(filePath, file.stream(), {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 400 });
    }

    // جلب الرابط العام
    const { data: publicUrl } = supabase
      .storage
      .from('player-files')
      .getPublicUrl(data.path);

    return NextResponse.json({ url: publicUrl.publicUrl }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}