import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jtcepxgoqbyfwljezndt.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0Y2VweGdvcWJ5ZndsamV6bmR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNDU4OTQsImV4cCI6MjA5MzYyMTg5NH0.FjQ0LAj52h44s-AwGyONKhZWJNf1-jeiMfntqc1ZZQg';

// Create a real client if keys exist, otherwise create a dummy client to avoid crashes
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const hasSupabaseConfig = true; // Use true since we have fallbacks now

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
  
  let fileToUpload = file;
  
  // Compress image if it's an image
  if (file.type.startsWith('image/')) {
    try {
      const compressedDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1200; // Better quality for real upload
            const scaleSize = Math.min(1, MAX_WIDTH / img.width);
            canvas.width = img.width * scaleSize;
            canvas.height = img.height * scaleSize;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      });
      
      // Convert data URL back to File
      const res = await fetch(compressedDataUrl);
      const blob = await res.blob();
      fileToUpload = new File([blob], fileName, { type: 'image/jpeg' });
    } catch (e) {
      console.warn('Compression failed, using original file:', e);
    }
  }

  const { error: uploadError } = await supabase.storage
    .from('portfolio_assets')
    .upload(fileName, fileToUpload);

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
