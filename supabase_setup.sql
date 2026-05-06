-- SUPABASE SETUP SCRIPT FOR S M HASINUR RAHMAN PORTFOLIO

-- 1. Profile Info Table
CREATE TABLE IF NOT EXISTS public.profile_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT,
  bio TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  avatar_url TEXT,
  resume_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Experiences Table
CREATE TABLE IF NOT EXISTS public.experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_institution TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT, -- 'Current', 'Former'
  type TEXT, -- 'professional', 'education', 'creative'
  description TEXT,
  bullet_points TEXT[],
  date_range TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Portfolio Items Table
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT, -- 'graphics', 'video', 'web', 'projects'
  image_url TEXT,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Achievements Table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE,
  description TEXT,
  image_url TEXT,
  full_story_link TEXT,
  author TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Blogs Table
CREATE TABLE IF NOT EXISTS public.blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Site Stats Table
CREATE TABLE IF NOT EXISTS public.site_stats (
  id TEXT PRIMARY KEY,
  views BIGINT DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- INITIAL DATA
INSERT INTO public.profile_info (name, title, bio, email, phone, location, avatar_url, resume_url)
VALUES (
  'S M Hasinur Rahman', 
  'Graphics Designer & Social Media Manager', 
  'Creative Graphics Designer and expert Social Media Manager dedicated to crafting visual stories and building digital presence. Currently studying CSE at UIU.', 
  'hasinurrahman.me@gmail.com', 
  '+8801518914773', 
  'Dhaka, Bangladesh', 
  '/hasinur_profile_pic_design_in_ps.png',
  '#'
) ON CONFLICT DO NOTHING;

INSERT INTO public.site_stats (id, views) VALUES ('global', 100000) ON CONFLICT DO NOTHING;

-- SECURITY POLICIES (Row Level Security)

-- Enable RLS
ALTER TABLE public.profile_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_stats ENABLE ROW LEVEL SECURITY;

-- Select Policies (Public read)
CREATE POLICY "Public Read Profile" ON public.profile_info FOR SELECT USING (true);
CREATE POLICY "Public Read Experiences" ON public.experiences FOR SELECT USING (true);
CREATE POLICY "Public Read Portfolio" ON public.portfolio_items FOR SELECT USING (true);
CREATE POLICY "Public Read Achievements" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Public Read Blogs" ON public.blogs FOR SELECT USING (true);
CREATE POLICY "Public Read Stats" ON public.site_stats FOR SELECT USING (true);

-- Messages Policies
CREATE POLICY "Public Insert Messages" ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin All Access Messages" ON public.messages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Update/Insert/Delete Policies (Authenticated Only)
CREATE POLICY "Admin All Access Profile" ON public.profile_info FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin All Access Experiences" ON public.experiences FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin All Access Portfolio" ON public.portfolio_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin All Access Achievements" ON public.achievements FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin All Access Blogs" ON public.blogs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Update Stats" ON public.site_stats FOR UPDATE USING (true); -- Allow public to increment views

-- STORAGE SETUP
-- Run these commands manually in SQL editor if storage doesn't exist
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio_assets', 'portfolio_assets', true) ON CONFLICT DO NOTHING;
CREATE POLICY "Public Access Assets" ON storage.objects FOR SELECT USING (bucket_id = 'portfolio_assets');
CREATE POLICY "Auth Insert Assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'portfolio_assets');
CREATE POLICY "Auth Update Assets" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'portfolio_assets');
CREATE POLICY "Auth Delete Assets" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'portfolio_assets');
