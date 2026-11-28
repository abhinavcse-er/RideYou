-- RideYou: promote the two existing Admin identities to the Admin role.
-- Run in Supabase SQL Editor after verifying the two expected Admin records in public.admins.
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

-- Keep the two agreed Admin identities active and use consistent display names.
update public.admins
set display_name = case lower(trim(display_name))
  when 'sujjet kumar' then 'Sujjet Kumar'
  when 'md kaif' then 'MD Kaif'
  else display_name
end,
active = true
where lower(trim(display_name)) in ('sujjet kumar', 'md kaif');

select profile_id, display_name, active
from public.admins
order by display_name;
