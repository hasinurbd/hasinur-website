-- SUPABASE SETUP SCRIPT FOR PORTFOLIO
-- RUN THIS IN YOUR SUPABASE SQL EDITOR

-- 1. Profile Info Table
CREATE TABLE IF NOT EXISTS profile_info (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT,
  title TEXT,
  bio TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  avatar_url TEXT,
  resume_url TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  behance_url TEXT,
  twitter_url TEXT,
  youtube_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Experiences Table
CREATE TABLE IF NOT EXISTS experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_institution TEXT,
  role TEXT,
  status TEXT,
  type TEXT,
  description TEXT,
  bullet_points TEXT[],
  date_range TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Portfolio Items Table
CREATE TABLE IF NOT EXISTS portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  category TEXT,
  description TEXT,
  image_url TEXT,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Achievements Table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  date TIMESTAMPTZ,
  description TEXT,
  image_url TEXT,
  full_story_link TEXT,
  author TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Blogs Table
CREATE TABLE IF NOT EXISTS blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  content TEXT,
  image_url TEXT,
  published_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Client Reviews Table
CREATE TABLE IF NOT EXISTS client_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  avatar_url TEXT,
  country_flag TEXT,
  rating FLOAT,
  service_taken TEXT,
  text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Messages (Contact Form) Table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Site Stats Table
CREATE TABLE IF NOT EXISTS site_stats (
  id TEXT PRIMARY KEY,
  views BIGINT DEFAULT 0
);

-- Initialize global views counter
INSERT INTO site_stats (id, views) VALUES ('global_views', 0) ON CONFLICT (id) DO NOTHING;

-- 9. Storage Setup
-- Run these one by one if they fail together
-- INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio_assets', 'portfolio_assets', true);

-- 10. Enable Row Level Security (RLS) - Optional but recommended for production
-- For simplicity in this template, we assuming you will configure policies as needed 
-- (e.g., public read, authenticated write)
