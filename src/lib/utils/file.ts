// src/lib/utils/file.ts

import { uploadAdditionalImage } from '@/lib/utils/upload';
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// تعريف أنواع الملفات المسموح بها وحجمها الأقصى

export const allowedFileTypes = {
  images: ['image/jpeg', 'image/png', 'image/webp'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  videos: ['video/mp4', 'video/webm']
};

export const maxFileSize = {
  image: 5 * 1024 * 1024, // 5MB
  document: 10 * 1024 * 1024, // 10MB
  video: 100 * 1024 * 1024 // 100MB
};

export const validateFile = (file: File, type: 'images' | 'documents' | 'videos'): boolean => {
  if (!file) return false;

  // Check file type
  if (!allowedFileTypes[type].includes(file.type)) {
    console.error('❌ نوع الملف غير مسموح به');
    return false;
  }

  // Check file size
  const maxSize = type === 'images' ? maxFileSize.image :
                 type === 'documents' ? maxFileSize.document :
                 maxFileSize.video;

  if (file.size > maxSize) {
    console.error('❌ حجم الملف كبير جداً');
    return false;
  }

  return true;
};

export const handleFileUpload = async (
  file: File,
  type: 'images' | 'documents' | 'videos'
): Promise<string | null> => {
  if (!validateFile(file, type)) return null;

  try {
    if (type === 'images') {
      // استخدم uploadAdditionalImage للصور الإضافية
      const userId = 'USER_ID_HERE'; // استبدلها بالمعرف الفعلي للمستخدم
      const result = await uploadAdditionalImage(file, userId);
      return result.url || null;
    } else {
      const url = await uploadFile(file);
      return url;
    }
  } catch (error) {
    console.error('❌ خطأ في رفع الملف:', error);
    return null;
  }
};

/**
 * Mock implementation of file upload that uses Supabase instead
 */
export async function uploadFile(file: File): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('player-files')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = await supabase.storage
      .from('player-files')
      .getPublicUrl(filePath);

    return data?.publicUrl || '';
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

/**
 * @deprecated Use Supabase storage instead
 */
export async function uploadFileToAzure(): Promise<string> {
  console.warn('⚠️ Azure Storage is disabled. Using Supabase storage instead.');
  return Promise.reject('Azure Storage is disabled - Use Supabase storage');
}