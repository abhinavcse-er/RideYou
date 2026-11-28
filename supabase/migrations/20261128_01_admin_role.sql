-- Step 1: rename the old mediator role to admin.
-- Run this migration before 20261128_02_admin_operations.sql.
do $$
begin
  if exists (
    select 1 from pg_enum e join pg_type t on t.oid=e.enumtypid
    join pg_namespace n on n.oid=t.typnamespace
    where n.nspname='public' and t.typname='rideyou_role' and e.enumlabel='mediator'
  ) and not exists (
    select 1 from pg_enum e join pg_type t on t.oid=e.enumtypid
    join pg_namespace n on n.oid=t.typnamespace
    where n.nspname='public' and t.typname='rideyou_role' and e.enumlabel='admin'
  ) then
    alter type public.rideyou_role rename value 'mediator' to 'admin';
  end if;
end $$;

do $$
begin
  if to_regclass('public.mediators') is not null and to_regclass('public.admins') is null then
    alter table public.mediators rename to admins;
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='bookings' and column_name='mediator_id')
     and not exists (select 1 from information_schema.columns where table_schema='public' and table_name='bookings' and column_name='admin_id') then
    alter table public.bookings rename column mediator_id to admin_id;
  end if;
end $$;

comment on table public.admins is 'Authorized RideYou booking administrators; replaces the legacy mediator concept.';
