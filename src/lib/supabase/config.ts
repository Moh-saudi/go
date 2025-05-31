// src/lib/supabase.js
import { type SupabaseClient } from '@supabase/supabase-js';

// Supabase config completely disabled
let supabaseInstance: SupabaseClient | null = null;

// Supabase config disabled
export function getSupabaseClient() {
  throw new Error('Supabase is disabled');
}

// دالة مساعدة للتحقق من توفر Supabase
export function isSupabaseAvailable() { return false; }

export const STORAGE_BUCKETS = {};

// وظائف مساعدة للتعامل مع التخزين
// Define interfaces for better type safety
type UploadResponse = {
  path: string;
};

interface PublicUrlResponse {
  publicUrl: string;
}

export async function uploadFile() { throw new Error('Supabase is disabled'); }