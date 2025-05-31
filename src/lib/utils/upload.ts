import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables for the new project');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB for videos
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];

export interface UploadResponse {
  url: string;
  error?: string;
}

// تعطيل دوال رفع الصور مؤقتاً
export const uploadProfileImage = async () => ({ url: '', error: 'رفع الصور معطل نهائياً' });

export const uploadAdditionalImage = async () => ({ url: '', error: 'رفع الصور معطل نهائياً' });

// حذف صورة من التخزين
export const deleteImage = async () => ({ error: 'حذف الصور معطل نهائياً' });
