-- Run after 20261128_01_admin_role.sql and 20261128_02_admin_operations.sql.
-- Critical state transitions and their audit records execute in one transaction.
-- These functions are callable only by the server's service_role.

create or replace function public.admin_quote_booking(
  p_booking_id uuid, p_fare numeric, p_admin_id uuid, p_actor_profile_id uuid
) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare v_booking public.bookings%rowtype;
begin
  if p_fare < 0 or p_fare > 1000000 then
    raise exception using message='INVALID_FARE', errcode='P0001';
  end if;
  update public.bookings
    set quoted_fare=p_fare,status='quoted',quoted_at=now(),admin_id=p_admin_id
    where id=p_booking_id and status='requested'
    returning * into v_booking;
  if not found then
    raise exception using message='BOOKING_NOT_QUOTABLE', errcode='P0001';
  end if;
  insert into public.booking_events(booking_id,actor_profile_id,from_status,to_status,note)
    values(v_booking.id,p_actor_profile_id,'requested','quoted','Fare quoted: '||p_fare::text);
  return jsonb_build_object('id',v_booking.id,'reference',v_booking.reference,'status',v_booking.status,'quoted_fare',v_booking.quoted_fare);
end;
$$;

create or replace function public.customer_accept_booking_quote(
  p_reference text, p_phone text
) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare v_booking public.bookings%rowtype;
begin
  update public.bookings
    set status='accepted',accepted_at=now()
    where reference=p_reference and customer_phone=p_phone and status='quoted'
    returning * into v_booking;
  if not found then
    raise exception using message='QUOTE_NOT_FOUND_OR_ALREADY_ACCEPTED', errcode='P0001';
  end if;
  insert into public.booking_events(booking_id,from_status,to_status,note)
    values(v_booking.id,'quoted','accepted','Customer accepted the quoted fare.');
  return jsonb_build_object('reference',v_booking.reference,'status',v_booking.status,'quoted_fare',v_booking.quoted_fare);
end;
$$;

create or replace function public.admin_assign_booking(
  p_booking_id uuid, p_vehicle_id uuid, p_driver_id uuid, p_ride_end_at timestamptz,
  p_admin_id uuid, p_actor_profile_id uuid
) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare v_booking public.bookings%rowtype; v_vehicle public.vehicles%rowtype; v_driver public.drivers%rowtype;
begin
  select * into v_booking from public.bookings where id=p_booking_id for update;
  if not found or v_booking.status <> 'accepted' then
    raise exception using message='BOOKING_NOT_ACCEPTED', errcode='P0001';
  end if;
  if p_ride_end_at <= v_booking.ride_at then
    raise exception using message='INVALID_TRIP_END', errcode='P0001';
  end if;
  select * into v_vehicle from public.vehicles
    where id=p_vehicle_id and status='active'
      and vehicle_class in ('hatchback','sedan','suv','muv','van','luxury')
      and seats >= v_booking.passengers;
  if not found then
    raise exception using message='FOUR_WHEELER_NOT_AVAILABLE_OR_CAPACITY_LOW', errcode='P0001';
  end if;
  select * into v_driver from public.drivers
    where id=p_driver_id and active=true and verification_status='verified'
      and owner_id=v_vehicle.owner_id;
  if not found then
    raise exception using message='DRIVER_NOT_VERIFIED_OR_OWNER_MISMATCH', errcode='P0001';
  end if;
  update public.bookings set vehicle_id=p_vehicle_id,driver_id=p_driver_id,
    ride_end_at=p_ride_end_at,status='assigned',admin_id=p_admin_id
    where id=p_booking_id returning * into v_booking;
  insert into public.booking_events(booking_id,actor_profile_id,from_status,to_status,note)
    values(v_booking.id,p_actor_profile_id,'accepted','assigned','Vehicle and driver assigned.');
  return jsonb_build_object('id',v_booking.id,'reference',v_booking.reference,'status',v_booking.status,
    'vehicle_id',v_booking.vehicle_id,'driver_id',v_booking.driver_id,'ride_end_at',v_booking.ride_end_at);
end;
$$;

create or replace function public.admin_set_trip_status(
  p_booking_id uuid, p_status text, p_note text, p_admin_id uuid, p_actor_profile_id uuid
) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare v_booking public.bookings%rowtype; v_old_status text;
begin
  select * into v_booking from public.bookings where id=p_booking_id for update;
  if not found then raise exception using message='BOOKING_NOT_FOUND', errcode='P0001'; end if;
  v_old_status:=v_booking.status;
  if not ((v_old_status='assigned' and p_status in ('started','cancelled'))
       or (v_old_status='started' and p_status in ('completed','cancelled'))) then
    raise exception using message='INVALID_TRIP_STATUS_TRANSITION', errcode='P0001';
  end if;
  update public.bookings set status=p_status,
    cancellation_reason=case when p_status='cancelled' then p_note else null end,
    admin_id=p_admin_id where id=p_booking_id returning * into v_booking;
  insert into public.booking_events(booking_id,actor_profile_id,from_status,to_status,note)
    values(v_booking.id,p_actor_profile_id,v_old_status,p_status,nullif(p_note,''));
  return jsonb_build_object('id',v_booking.id,'reference',v_booking.reference,'status',v_booking.status);
end;
$$;

revoke all on function public.admin_quote_booking(uuid,numeric,uuid,uuid) from public, anon, authenticated;
revoke all on function public.customer_accept_booking_quote(text,text) from public, anon, authenticated;
revoke all on function public.admin_assign_booking(uuid,uuid,uuid,timestamptz,uuid,uuid) from public, anon, authenticated;
revoke all on function public.admin_set_trip_status(uuid,text,text,uuid,uuid) from public, anon, authenticated;
grant execute on function public.admin_quote_booking(uuid,numeric,uuid,uuid) to service_role;
grant execute on function public.customer_accept_booking_quote(text,text) to service_role;
grant execute on function public.admin_assign_booking(uuid,uuid,uuid,timestamptz,uuid,uuid) to service_role;
grant execute on function public.admin_set_trip_status(uuid,text,text,uuid,uuid) to service_role;
