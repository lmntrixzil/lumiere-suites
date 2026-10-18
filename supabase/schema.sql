-- Lumière Suites: run once in the Supabase SQL editor.
-- All site data (apartments, cars, bookings, codes, settings, enquiries) lives in one
-- JSON table so the admin can add fields without migrations.

create table if not exists public.lumiere_records (
  collection text not null,
  id         text not null,
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (collection, id)
);

create index if not exists lumiere_records_collection_idx on public.lumiere_records (collection, updated_at desc);

-- Only the server (service role key) may read or write. Nothing is exposed to the browser.
alter table public.lumiere_records enable row level security;

-- Storage buckets: public photos and private guest IDs.
insert into storage.buckets (id, name, public) values ('photos', 'photos', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('guest-ids', 'guest-ids', false) on conflict (id) do nothing;
