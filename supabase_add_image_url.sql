-- Add image_url to experiences
ALTER TABLE public.experiences ADD COLUMN IF NOT EXISTS image_url TEXT;
