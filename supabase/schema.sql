-- Run this script in Supabase SQL Editor.
-- The service-role key must stay on the server and never be committed.

create extension if not exists pgcrypto;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  customer_name text not null check (char_length(customer_name) between 2 and 80),
  customer_phone text not null check (customer_phone ~ '^[6-9][0-9]{9}$'),
  pickup text not null check (char_length(pickup) between 2 and 180),
  destination text not null check (char_length(destination) between 2 and 180),
  ride_at timestamptz not null,
  passengers smallint not null check (passengers between 1 and 8),
  trip_type text not null check (trip_type in ('local','outstation')),
  customer_note text,
  status text not null default 'requested'
    check (status in ('requested','quoted','accepted','assigned','started','completed','cancelled')),
  quoted_fare numeric(10,2) check (quoted_fare is null or quoted_fare >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bookings_created_at_idx on public.bookings (created_at desc);
create index if not exists bookings_ride_at_idx on public.bookings (ride_at);
create index if not exists bookings_status_idx on public.bookings (status);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at before update on public.bookings
for each row execute function public.set_updated_at();

alter table public.bookings enable row level security;
-- No anonymous/authenticated policies: browser clients cannot read or mutate bookings.
-- Add authenticated role policies only with the admin/driver identity model in the next milestone.
