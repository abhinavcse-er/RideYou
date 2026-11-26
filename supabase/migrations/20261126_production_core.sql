-- RideYou production core schema (additive migration).
-- Run after the existing supabase/schema.sql in the Supabase SQL Editor.
-- All application tables remain closed to browser roles until explicit RLS
-- policies are added. The server must never expose the service-role key.

create extension if not exists pgcrypto;
create extension if not exists btree_gist;

do $$ begin
  create type public.rideyou_role as enum ('customer', 'owner', 'driver', 'mediator');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 100),
  phone text unique check (phone is null or phone ~ '^[6-9][0-9]{9}$'),
  role public.rideyou_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.owners (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete restrict,
  business_name text,
  verification_status text not null default 'pending'
    check (verification_status in ('pending', 'verified', 'rejected', 'suspended')),
  created_at timestamptz not null default now()
);

create table if not exists public.drivers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles(id) on delete restrict,
  owner_id uuid references public.owners(id) on delete set null,
  full_name text not null check (char_length(full_name) between 2 and 100),
  phone text not null check (phone ~ '^[6-9][0-9]{9}$'),
  verification_status text not null default 'pending'
    check (verification_status in ('pending', 'verified', 'rejected', 'suspended')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.mediators (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete restrict,
  display_name text not null unique
    check (display_name in ('Booking Manager', 'Booking Sahayak')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.owners(id) on delete restrict,
  driver_id uuid references public.drivers(id) on delete set null,
  vehicle_name text not null check (char_length(vehicle_name) between 2 and 100),
  registration_number text not null unique,
  seats smallint not null check (seats between 1 and 30),
  photo_path text,
  base_fare numeric(10,2) check (base_fare is null or base_fare >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'active', 'inactive', 'rejected', 'maintenance')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bookings
  add column if not exists customer_id uuid references public.profiles(id) on delete set null,
  add column if not exists vehicle_id uuid references public.vehicles(id) on delete restrict,
  add column if not exists mediator_id uuid references public.mediators(id) on delete set null,
  add column if not exists driver_id uuid references public.drivers(id) on delete set null,
  add column if not exists ride_end_at timestamptz,
  add column if not exists cancellation_reason text;

alter table public.bookings
  drop constraint if exists bookings_ride_end_after_start_check;
alter table public.bookings
  add constraint bookings_ride_end_after_start_check
  check (ride_end_at is null or ride_end_at > ride_at);

create table if not exists public.booking_events (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  from_status text,
  to_status text not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists vehicles_owner_id_idx on public.vehicles(owner_id);
create index if not exists vehicles_status_idx on public.vehicles(status);
create index if not exists drivers_owner_id_idx on public.drivers(owner_id);
create index if not exists bookings_customer_id_idx on public.bookings(customer_id);
create index if not exists bookings_vehicle_id_ride_at_idx on public.bookings(vehicle_id, ride_at);
create index if not exists bookings_mediator_id_created_at_idx on public.bookings(mediator_id, created_at desc);
create index if not exists booking_events_booking_created_idx on public.booking_events(booking_id, created_at);

-- Prevent overlapping assigned trips for the same vehicle or driver.
-- ride_end_at must be set before assignment; the backend must calculate/store
-- the expected end time and perform assignment in a database transaction.
alter table public.bookings
  drop constraint if exists bookings_no_vehicle_overlap;
alter table public.bookings
  add constraint bookings_no_vehicle_overlap
  exclude using gist (
    vehicle_id with =,
    tstzrange(ride_at, ride_end_at, '[)') with &&
  )
  where (vehicle_id is not null and ride_end_at is not null and status in ('assigned', 'started'));

alter table public.bookings
  drop constraint if exists bookings_no_driver_overlap;
alter table public.bookings
  add constraint bookings_no_driver_overlap
  exclude using gist (
    driver_id with =,
    tstzrange(ride_at, ride_end_at, '[)') with &&
  )
  where (driver_id is not null and ride_end_at is not null and status in ('assigned', 'started'));

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists vehicles_set_updated_at on public.vehicles;
create trigger vehicles_set_updated_at before update on public.vehicles
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.owners enable row level security;
alter table public.drivers enable row level security;
alter table public.mediators enable row level security;
alter table public.vehicles enable row level security;
alter table public.booking_events enable row level security;

-- No anon/authenticated policies are intentionally added here.
-- Next milestone: server-verified roles, private contact access and scoped RLS.
