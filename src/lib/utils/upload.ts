import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables for the new project');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

interface UploadResponse {
  url: string;
  error?: string;
}

export const uploadProfileImage = async (file: File, userId: string): Promise<UploadResponse> => {
  try {
    // التحقق من نوع الملف
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        url: '',
        error: 'نوع الملف غير مدعوم. يرجى استخدام صورة بصيغة JPG, PNG, GIF, أو WEBP'
      };
    }

    // التحقق من حجم الملف
    if (file.size > MAX_FILE_SIZE) {
      return {
        url: '',
        error: 'حجم الصورة يجب أن لا يتجاوز 5 ميجابايت'
      };
    }

    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/profile.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('player-uploads')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Error uploading profile image:', error);
      return {
        url: '',
        error: 'فشل في رفع الصورة. يرجى المحاولة مرة أخرى'
      };
    }

    const { data: urlData } = supabase.storage
      .from('player-uploads')
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl
    };
  } catch (error) {
    console.error('Error in uploadProfileImage:', error);
    return {
      url: '',
      error: 'حدث خطأ أثناء رفع الصورة'
    };
  }
};

export const uploadAdditionalImage = async (file: File, userId: string): Promise<UploadResponse> => {
  try {
    // التحقق من نوع الملف
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        url: '',
        error: 'نوع الملف غير مدعوم. يرجى استخدام صورة بصيغة JPG, PNG, GIF, أو WEBP'
      };
    }

    // التحقق من حجم الملف
    if (file.size > MAX_FILE_SIZE) {
      return {
        url: '',
        error: 'حجم الصورة يجب أن لا يتجاوز 5 ميجابايت'
      };
    }

    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/additional/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('player-uploads')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Error uploading additional image:', error);
      return {
        url: '',
        error: 'فشل في رفع الصورة. يرجى المحاولة مرة أخرى'
      };
    }

    const { data: urlData } = supabase.storage
      .from('player-uploads')
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl
    };
  } catch (error) {
    console.error('Error in uploadAdditionalImage:', error);
    return {
      url: '',
      error: 'حدث خطأ أثناء رفع الصورة'
    };
  }
};

export const deleteImage = async (path: string): Promise<{ error?: string }> => {
  try {
    const { error } = await supabase.storage
      .from('player-uploads')
      .remove([path]);

    if (error) {
      console.error('Error deleting image:', error);
      return {
        error: 'فشل في حذف الصورة'
      };
    }

    return {};
  } catch (error) {
    console.error('Error in deleteImage:', error);
    return {
      error: 'حدث خطأ أثناء حذف الصورة'
    };
  }
};