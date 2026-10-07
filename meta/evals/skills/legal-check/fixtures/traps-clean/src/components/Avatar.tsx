'use client';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient('url', 'key');
export async function upload(file: File) {
  return supabase.storage
    .from('avatars')
    .upload(file.name, file);
}
