create table if not exists public.community_sites (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),
    name text not null check (char_length(name) between 1 and 40),
    handle text not null check (char_length(handle) between 1 and 24),
    about text not null check (char_length(about) between 1 and 180),
    color text not null default '#69ff9e'
        check (color in ('#69ff9e', '#ff5de4', '#6ee7ff', '#ffbd59'))
);

alter table public.community_sites enable row level security;

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
