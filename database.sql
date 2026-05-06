-- Supabase Database Schema for Portfolio

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profile Info Table
create table public.profile_info (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  headline text,
  bio text,
  email text,
  phone text,
  location text,
  resume_url text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Portfolio Items Table
create table public.portfolio_items (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  category text not null check (category in ('graphics', 'video', 'web', 'projects')),
  image_url text,
  link text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Experiences Table
create table public.experiences (
  id uuid primary key default uuid_generate_v4(),
  company_institution text not null,
  role text not null,
  status text, -- e.g., 'Current', 'Former'
  logo_url text,
  description text,
  bullet_points text[], -- array of text
  type text not null check (type in ('education', 'professional', 'creative')),
  date_range text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Achievements Table
create table public.achievements (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  date timestamp with time zone not null,
  image_url text,
  description text,
  full_story_link text,
  author text default 'S M Hasinur Rahman',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Insert Default Profile Data
insert into public.profile_info (name, headline, bio, email, phone, location)
values (
  'S M Hasinur Rahman',
  'CSE Undergraduate & Creative Professional',
  'I am currently an undergrad student in CSE at United International University. I have some experience in professional work. My skills include Graphic Design, Social Media Management, Video Editing, and Programming. You can find my basic information and portfolio here.',
  'hasinurrahman.me@gmail.com',
  '+8801518914773',
  'Dhaka, Bangladesh'
);

-- 5. Site Stats Table
create table public.site_stats (
  id text primary key,
  views bigint default 100125,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
insert into public.site_stats (id, views) values ('global', 100125);
alter table public.site_stats enable row level security;
create policy "Allow public read access for stats" on public.site_stats for select using (true);
create policy "Allow public update for stats" on public.site_stats for update using (true);

-- Enable RLS (Row Level Security) for public reads, authenticated writes
alter table public.profile_info enable row level security;
alter table public.portfolio_items enable row level security;
alter table public.experiences enable row level security;
alter table public.achievements enable row level security;

-- Policies
-- Public read access
create policy "Allow public read-only access for profile" on public.profile_info for select using (true);
create policy "Allow public read-only access for portfolio" on public.portfolio_items for select using (true);
create policy "Allow public read-only access for experiences" on public.experiences for select using (true);
create policy "Allow public read-only access for achievements" on public.achievements for select using (true);

-- Authenticated write access
create policy "Allow authenticated admin to manage profile" on public.profile_info for all using (auth.role() = 'authenticated');
create policy "Allow authenticated admin to manage portfolio" on public.portfolio_items for all using (auth.role() = 'authenticated');
create policy "Allow authenticated admin to manage experiences" on public.experiences for all using (auth.role() = 'authenticated');
create policy "Allow authenticated admin to manage achievements" on public.achievements for all using (auth.role() = 'authenticated');

-- Storage Setup
insert into storage.buckets (id, name, public) values ('media', 'media', true);

create policy "Public Access to media" on storage.objects for select using ( bucket_id = 'media' );
create policy "Auth upload to media" on storage.objects for insert with check ( bucket_id = 'media' and auth.role() = 'authenticated');
create policy "Auth update to media" on storage.objects for update using ( bucket_id = 'media' and auth.role() = 'authenticated');
create policy "Auth delete from media" on storage.objects for delete using ( bucket_id = 'media' and auth.role() = 'authenticated');
