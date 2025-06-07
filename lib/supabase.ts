import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadCertificate(file: File, fileName: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('certificates')
    .upload(fileName, file);

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('certificates')
    .getPublicUrl(fileName);

  return publicUrl;
}

export async function deleteCertificate(fileName: string): Promise<void> {
  const { error } = await supabase.storage
    .from('certificates')
    .remove([fileName]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}