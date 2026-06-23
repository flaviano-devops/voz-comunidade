create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  username text not null unique,
  bio text,
  avatar_initial text not null default '?',
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) <= 280),
  tags text[] not null default '{}',
  featured boolean not null default false,
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.saved_posts (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) <= 160),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.saved_posts enable row level security;
alter table public.chat_messages enable row level security;

create policy "Profiles are visible to everyone"
  on public.profiles for select
  using (true);

create policy "Users can create their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Posts are visible to everyone"
  on public.posts for select
  using (true);

create policy "Authenticated users can create posts"
  on public.posts for insert
  with check (auth.uid() = author_id);

create policy "Authors can update their posts"
  on public.posts for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

create policy "Authors can delete their posts"
  on public.posts for delete
  using (auth.uid() = author_id);

create policy "Post likes are visible to everyone"
  on public.post_likes for select
  using (true);

create policy "Users can like posts"
  on public.post_likes for insert
  with check (auth.uid() = user_id);

create policy "Users can remove their likes"
  on public.post_likes for delete
  using (auth.uid() = user_id);

create policy "Users can view their saved posts"
  on public.saved_posts for select
  using (auth.uid() = user_id);

create policy "Users can save posts"
  on public.saved_posts for insert
  with check (auth.uid() = user_id);

create policy "Users can remove saved posts"
  on public.saved_posts for delete
  using (auth.uid() = user_id);

create policy "Chat messages are visible to everyone"
  on public.chat_messages for select
  using (true);

create policy "Authenticated users can send chat messages"
  on public.chat_messages for insert
  with check (auth.uid() = author_id);

create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_tags_idx on public.posts using gin (tags);
create index if not exists chat_messages_created_at_idx on public.chat_messages (created_at desc);
