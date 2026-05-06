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
    if (file.type.startsWith('image/')) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 500;
            const scaleSize = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.7));
          };
          img.onerror = () => resolve(e.target?.result as string);
          img.src = e.target?.result as string;
        };
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
      });
    } else {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
      });
    }
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
