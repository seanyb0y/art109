-- Store each public site with bounded fields and an allowlisted accent color.
create table if not exists public.community_sites (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),
    name text not null check (char_length(name) between 1 and 40),
    handle text not null check (char_length(handle) between 1 and 24),
    about text not null check (char_length(about) between 1 and 180),
    color text not null default '#69ff9e'
        check (color in ('#69ff9e', '#ff5de4', '#6ee7ff', '#ffbd59'))
);

alter table public.community_sites
    add column if not exists image_path text;

alter table public.community_sites enable row level security;

-- Visitors can read and publish, but the table policies still constrain inserts.
drop policy if exists "Anyone can read community sites" on public.community_sites;
create policy "Anyone can read community sites"
    on public.community_sites
    for select
    to anon, authenticated
    using (true);

drop policy if exists "Anyone can publish a community site" on public.community_sites;
create policy "Anyone can publish a community site"
    on public.community_sites
    for insert
    to anon, authenticated
    with check (
        char_length(name) between 1 and 40
        and char_length(handle) between 1 and 24
        and char_length(about) between 1 and 180
        and color in ('#69ff9e', '#ff5de4', '#6ee7ff', '#ffbd59')
    );

grant select, insert on public.community_sites to anon, authenticated;
grant usage on schema public to anon, authenticated;

comment on table public.community_sites is
    'Public community submissions. Anonymous insert is enabled for the demo; use authentication and rate limiting before production deployment.';

-- Replies are attached to a site and removed automatically if that site is deleted.
create table if not exists public.community_site_replies (
    id uuid primary key default gen_random_uuid(),
    site_id uuid not null references public.community_sites(id) on delete cascade,
    created_at timestamptz not null default now(),
    handle text not null check (char_length(btrim(handle)) between 1 and 24),
    message text not null check (char_length(btrim(message)) between 1 and 500)
);

create index if not exists community_site_replies_site_created_idx
    on public.community_site_replies (site_id, created_at);

alter table public.community_site_replies enable row level security;

drop policy if exists "Anyone can read site replies" on public.community_site_replies;
create policy "Anyone can read site replies"
    on public.community_site_replies
    for select
    to anon, authenticated
    using (true);

drop policy if exists "Anyone can publish a site reply" on public.community_site_replies;
create policy "Anyone can publish a site reply"
    on public.community_site_replies
    for insert
    to anon, authenticated
    with check (
        char_length(btrim(handle)) between 1 and 24
        and char_length(btrim(message)) between 1 and 500
    );

grant select, insert on public.community_site_replies to anon, authenticated;

comment on table public.community_site_replies is
    'Public replies to community sites. Anonymous insert is enabled for the demo; add moderation and rate limiting before production deployment.';

-- Expose one aggregate per site so the web can display reply totals efficiently.
create or replace view public.community_site_reply_counts
    with (security_invoker = true)
as
    select site_id, count(*) as reply_count
    from public.community_site_replies
    group by site_id;

grant select on public.community_site_reply_counts to anon, authenticated;

comment on view public.community_site_reply_counts is
    'Public reply totals grouped by community site.';

-- Public images are served by URL; anonymous visitors may upload, but not replace/delete objects.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'community-site-images',
    'community-site-images',
    true,
    5242880,
    array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone can view community site images" on storage.objects;
create policy "Anyone can view community site images"
    on storage.objects
    for select
    to anon, authenticated
    using (bucket_id = 'community-site-images');

drop policy if exists "Anyone can upload community site images" on storage.objects;
create policy "Anyone can upload community site images"
    on storage.objects
    for insert
    to anon, authenticated
    with check (bucket_id = 'community-site-images');

notify pgrst, 'reload schema';
