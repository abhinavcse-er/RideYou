-- Grant the trusted RideYou API service role the read access required by
-- customer booking history joins. Browser roles remain blocked by RLS.
grant usage on schema public to service_role;

grant select on table
  public.bookings,
  public.vehicles,
  public.drivers
to service_role;

-- Customer account and session tables are granted by
-- 20261128_04_customer_password_accounts.sql.
