# RideYou — four-wheeler booking platform

RideYou connects customers with verified local vehicle owners through a booking workflow coordinated by the RideYou **Admin** team. This product supports four-wheelers only: hatchbacks, sedans, SUVs, MUVs, vans and luxury cars. Two-wheelers are not part of the service.

## Website

GitHub Pages: https://abhinavcse-er.github.io/RideYou/

The frontend is API-driven. Booking requests and vehicle listings are fetched from the RideYou server; the browser is not the source of truth.

## Architecture

- **Frontend:** React 18 + Vite, responsive mobile-first UI, deployed as a static GitHub Pages website.
- **API:** Node.js 20+ + Express, modular routes and services.
- **Database and authentication:** Supabase PostgreSQL and Supabase Auth.
- **Roles:** customer, vehicle owner, driver and admin. The legacy mediator role is migrated to admin; there is no separate mediator workspace.
- **Admin security:** Admin endpoints require a valid Supabase session, profiles.role = admin, and an active row in public.admins. The service-role key remains server-only.
- **Booking controls:** server-side fare quotes, customer fare acceptance, vehicle/driver assignment, trip state transitions and booking audit events.
- **Fleet rule:** public inventory contains only active vehicles explicitly classified as four-wheelers. Vehicle class is verified by Admin before activation.

## Booking workflow

1. Customer selects a four-wheeler and submits pickup, destination, date, time and passenger details.
2. Admin reviews the request and sends a fare quote.
3. Customer checks the booking using reference + phone and accepts the quoted fare.
4. Admin assigns an active four-wheeler and a verified driver. Database overlap constraints reject conflicting vehicle/driver schedules.
5. Admin starts and completes the trip; customers can check assigned vehicle and driver name without exposing private phone numbers.

## Admin workspace

Admin signs in using a provisioned Supabase OTP account. The dashboard provides booking queue, fare quoting, assignment, trip status, owner verification, four-wheeler approval/classification and driver registration.

Only two existing Booking Team identities should be migrated/provisioned as Admin initially. Do not grant admin role from a public signup flow.

## Environment

Frontend (client/.env or GitHub Actions variables):
- VITE_API_URL: deployed API origin, for example your Render service URL.
- VITE_SUPABASE_URL: Supabase project URL.
- VITE_SUPABASE_ANON_KEY: Supabase publishable/anon key only.

Backend (server/.env or Render environment):
- PORT
- CLIENT_ORIGIN (comma-separated allowed frontend origins)
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY (server only; never expose in frontend or commit)

## Database migration

Run these SQL files in Supabase SQL Editor in this exact order, after the existing supabase/schema.sql and 20261126_production_core.sql migrations have been applied:

1. supabase/migrations/20261128_01_admin_role.sql
2. supabase/migrations/20261128_02_admin_operations.sql
3. supabase/migrations/20261128_03_atomic_booking_operations.sql

The first migration renames the legacy mediator enum value to admin, renames mediators to admins, and renames the booking foreign key. The second adds four-wheeler classification and customer quote acceptance fields. The third installs atomic database operations so each quote, customer acceptance, assignment and trip status update is committed together with its audit event. Existing active vehicles without an explicit four-wheeler class are made inactive until Admin verifies them.

Before enabling Admin access, confirm the two intended profiles have the admin role and active rows in public.admins. Keep the existing display names Booking Manager and Booking Sahayak if those are the intended two operators.

## Local development and checks

Requires Node.js 20+.

- Install: npm install
- Run locally: npm run dev
- Run automated policy tests: npm test
- Build frontend: npm run build

GitHub Actions runs the server policy tests and frontend production build on pushes and pull requests.

## Production readiness checklist

- Apply and verify database migrations in Supabase.
- Confirm the two Admin profiles and active admin records.
- Configure Render environment variables and allowed GitHub Pages origin.
- Configure Supabase SMS OTP delivery.
- Run end-to-end tests with real customer, owner, driver and Admin test accounts.
- Verify vehicle/driver conflict rejection and audit events under concurrent requests.
- Verify Storage uploads and privacy policies before enabling photo uploads.
- Check monitoring, backups, restore procedure, rate limits and abuse controls.

Free-tier hosting may sleep, pause or impose quotas. Zero latency cannot be guaranteed; the application should show clear loading/error states and be measured under real traffic before being described as production-reliable.
