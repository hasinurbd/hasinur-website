import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a real client if keys exist, otherwise create a dummy client to avoid crashes
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://mock.supabase.co', 'mock-key', { auth: { persistSession: false } });

export const hasSupabaseConfig = !!(supabaseUrl && supabaseAnonKey);

export const uploadAsset = async (file: File): Promise<string | null> => {
  if (!hasSupabaseConfig) {
    alert("Supabase not fully configured. Using mock data.");
    return URL.createObjectURL(file);
  }
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from('portfolio_assets')
    .upload(fileName, file);

  if (uploadError) {
    console.error('Upload Error:', uploadError);
    if (uploadError.message.toLowerCase().includes('bucket not found') || uploadError.message.includes('does not exist')) {
      alert('Error: Storage bucket "portfolio_assets" not found.\n\nPlease run this SQL in your Supabase SQL Editor:\nINSERT INTO storage.buckets (id, name, public) VALUES (\'portfolio_assets\', \'portfolio_assets\', true);');
    } else if (uploadError.message.toLowerCase().includes('row-level security') || uploadError.message.toLowerCase().includes('violates row-level security')) {
      alert('Error: RLS Policy Violation.\n\nPlease run this SQL in your Supabase SQL Editor to allow uploads:\n\nCREATE POLICY "Allow authenticated uploads" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = \'portfolio_assets\');\nCREATE POLICY "Allow public read" ON storage.objects FOR SELECT USING (bucket_id = \'portfolio_assets\');\nCREATE POLICY "Allow auth update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = \'portfolio_assets\');');
    } else {
      alert(`Upload error: ${uploadError.message}`);
    }
    return null;
  }

  const { data } = supabase.storage.from('portfolio_assets').getPublicUrl(fileName);
  return data.publicUrl;
};
