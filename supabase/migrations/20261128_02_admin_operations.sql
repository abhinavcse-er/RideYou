-- Run only after 20261128_01_admin_role.sql.
alter table public.vehicles
  add column if not exists vehicle_class text;
alter table public.vehicles
  drop constraint if exists vehicles_four_wheeler_class_check;
alter table public.vehicles
  add constraint vehicles_four_wheeler_class_check
  check (vehicle_class is null or vehicle_class in ('hatchback','sedan','suv','muv','van','luxury'));

-- Existing inventory must be explicitly classified by an administrator before
-- it appears publicly. This prevents unknown/two-wheeler records being exposed.
update public.vehicles set status='inactive'
where status='active' and vehicle_class is null;

alter table public.bookings
  add column if not exists quoted_at timestamptz,
  add column if not exists accepted_at timestamptz,
  add column if not exists payment_status text not null default 'pending'
    check (payment_status in ('pending','paid','refunded','not_required'));

create index if not exists bookings_admin_created_idx on public.bookings(admin_id, created_at desc);
create index if not exists bookings_customer_phone_reference_idx on public.bookings(reference, customer_phone);

-- Enforce four-wheel-only inventory at the database boundary.
create or replace function public.guard_four_wheeler_vehicle()
returns trigger language plpgsql as $$
begin
  if new.seats < 4 then
    raise exception 'RideYou only accepts four-wheelers with at least four seats';
  end if;
  if new.status = 'active' and new.vehicle_class is null then
    raise exception 'Vehicle class must be verified before activation';
  end if;
  return new;
end;
$$;
drop trigger if exists vehicles_four_wheeler_guard on public.vehicles;
create trigger vehicles_four_wheeler_guard before insert or update on public.vehicles
for each row execute function public.guard_four_wheeler_vehicle();

-- All admin operations continue to use server-side service-role access.
-- No browser RLS policies are added. Audit events are written by the API.
