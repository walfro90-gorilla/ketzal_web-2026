create table if not exists public.site_settings (
    id integer primary key default 1 check (id = 1), -- Singleton pattern
    site_name text default 'Ketzal',
    site_description text,
    logo_url text, -- For now just a URL string
    contact_email text,
    contact_phone text,
    maintenance_mode boolean default false,
    updated_at timestamp with time zone default now()
);

-- Insert default row if not exists
insert into public.site_settings (id, site_name)
values (1, 'Ketzal')
on conflict (id) do nothing;

-- RLS
alter table public.site_settings enable row level security;

-- Policies (Admins can update, Everyone can read)
create policy "Public read access" on public.site_settings
    for select using (true);

create policy "Admins can update" on public.site_settings
    for update using (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid() and profiles.role = 'admin'
        )
    );
