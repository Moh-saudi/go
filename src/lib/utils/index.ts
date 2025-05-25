// src/lib/utils/index.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
// تم تعطيل Azure مؤقتاً
// export { uploadFileToAzure } from "./upload";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
  }).format(price)
}

export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

// إضافة دالة رفع الملفات باستخدام Supabase
export const uploadFileToStorage = async (file: File, bucket: string) => {
  try {
    const { getSupabaseClient } = await import('@/lib/supabase/config')
    const supabase = getSupabaseClient();
    
    if (!supabase) {
      throw new Error('Supabase client is not available. Please check your environment variables.');
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`

    const { data, error } = await supabase
      .storage
      .from(bucket)
      .upload(fileName, file)

    if (error) throw error
    return data.path
  } catch (error) {
    console.error('خطأ في رفع الملف:', error)
    throw error
  }
}