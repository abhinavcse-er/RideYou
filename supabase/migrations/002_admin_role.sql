-- RideYou: promote the two existing Booking Team identities to the Admin role.
-- Run in Supabase SQL Editor after confirming the two rows in public.mediators.
-- Rename the existing identity table so the Admin role is consistent end to end.
alter table if exists public.mediators rename to admins;

do $$
declare constraint_row record;
begin
  for constraint_row in
    select c.conname
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'profiles'
      and c.contype = 'c'
      and pg_get_constraintdef(c.oid) ilike '%role%'
  loop
    execute format('alter table public.profiles drop constraint %I', constraint_row.conname);
  end loop;
end $$;

update public.profiles
set role = 'admin'
where role = 'mediator';

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('customer', 'owner', 'driver', 'admin'));

-- The two Admin accounts must already have active identity rows.
-- Verify exactly two rows and set their display names/active flags separately
-- if your existing records differ.
select profile_id, display_name, active
from public.admins
order by display_name;
