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

// دالة مساعدة لرفع صورة عبر دالة Edge
async function uploadImageViaEdgeFunction(file: File, userToken: string, edgeEndpoint: string): Promise<UploadResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(edgeEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`
      },
      body: formData
    });
    const result = await res.json();
    if (!res.ok || result.error) {
      return { url: '', error: result.error || 'فشل في رفع الصورة عبر الدالة الخارجية' };
    }
    return { url: result.url };
  } catch (error) {
    return { url: '', error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// رفع صورة البروفايل عبر دالة Edge
export const uploadProfileImage = async (file: File, userId: string, userToken?: string): Promise<UploadResponse> => {
  // يجب تمرير userToken وendpoint
  if (!userToken) return { url: '', error: 'مفقود رمز المصادقة' };
  const edgeEndpoint = '/api/edge-upload-profile'; // غيّر هذا حسب مسار دالتك
  return uploadImageViaEdgeFunction(file, userToken, edgeEndpoint);
};

// رفع صورة إضافية عبر دالة Edge
export const uploadAdditionalImage = async (file: File, userId: string, userToken?: string): Promise<UploadResponse> => {
  if (!userToken) return { url: '', error: 'مفقود رمز المصادقة' };
  const edgeEndpoint = '/api/edge-upload-additional'; // غيّر هذا حسب مسار دالتك
  return uploadImageViaEdgeFunction(file, userToken, edgeEndpoint);
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