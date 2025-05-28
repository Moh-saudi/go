// src/lib/supabase.js
import { uploadAdditionalImage } from '@/lib/utils/upload';
import { createClient } from '@supabase/supabase-js';

// تنفيذ نمط العازل (singleton) للتأكد من إنشاء عميل واحد فقط
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  // If client already exists, return it
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Check if environment variables are properly set
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase environment variables are missing:', {
      url: supabaseUrl ? 'set' : 'missing',
      key: supabaseKey ? 'set' : 'missing'
    });
    throw new Error('Supabase environment variables are not properly configured');
  }

  try {
    supabaseInstance = createClient(supabaseUrl, supabaseKey);
    return supabaseInstance;
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    throw error;
  }
}

// دالة مساعدة للتحقق من توفر Supabase
export function isSupabaseAvailable() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  PLAYER_IMAGES: 'player-images',
  DOCUMENTS: 'documents',
  PAYMENT_RECEIPTS: 'payment-receipts',
  PLAYER_UPLOADS: 'player-uploads'
} as const;

// وظائف مساعدة للتعامل مع التخزين
// Define interfaces for better type safety
interface UploadResponse {
  path: string;
}

interface PublicUrlResponse {
  publicUrl: string;
}

export async function uploadFile(
  file: File | Blob,
  bucket: keyof typeof STORAGE_BUCKETS,
  path: string,
  userToken?: string
): Promise<string | null> {
  // إذا كان bucket هو player-uploads استخدم uploadAdditionalImage
  if (bucket === STORAGE_BUCKETS.PLAYER_UPLOADS && file instanceof File) {
    const userId = 'USER_ID_HERE'; // استبدلها بالمعرف الفعلي للمستخدم
    const result = await uploadAdditionalImage(file, userId, userToken);
    return result.url || null;
  }
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl((data as UploadResponse).path);

    return (urlData as PublicUrlResponse).publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
}