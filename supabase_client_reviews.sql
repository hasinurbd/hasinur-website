-- Create client_reviews table
create table public.client_reviews (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  avatar_url text,
  country_flag text,
  rating integer default 5,
  service_taken text,
  text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Give access to anon (read) and authenticated (all)
alter table public.client_reviews enable row level security;

create policy "Allow public read access"
  on public.client_reviews for select
  using (true);

create policy "Allow authenticated insert"
  on public.client_reviews for insert
  to authenticated
  with check (true);

create policy "Allow authenticated update"
  on public.client_reviews for update
  to authenticated
  using (true);

create policy "Allow authenticated delete"
  on public.client_reviews for delete
  to authenticated
  using (true);
