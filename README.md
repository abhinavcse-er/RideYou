# RideYou — Bihar ride booking platform

RideYou connects customers with approved local vehicle owners through a simple booking workflow. Customers request a vehicle; a RideYou Admin checks availability and confirms the fare before a trip is accepted.

## Website

GitHub Pages deployment: https://abhinavcse-er.github.io/RideYou/

The frontend is API-driven. Booking requests and vehicle listings are fetched from the RideYou server; the browser is not used as the source of truth.

## Architecture

- **Frontend:** React + Vite, deployed as a static website.
- **API:** Node.js + Express, modular routes and services.
- **Database and authentication:** Supabase PostgreSQL and Supabase Auth.
- **Roles:** customer, vehicle owner, driver, and two invite-only Admin accounts.
- **Security:** server-side role checks; Supabase service-role key stays on the server.

## Environment

Frontend (`client/.env` or GitHub Actions variables):
- `VITE_API_URL`: deployed API origin, for example your Render service URL.
- `VITE_SUPABASE_URL`: Supabase project URL.
- `VITE_SUPABASE_ANON_KEY`: Supabase publishable/anon key only.

Backend (`server/.env` or Render environment):
- `PORT`
- `CLIENT_ORIGIN` (comma-separated allowed frontend origins)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server only; never expose in frontend or commit)

Copy `client/.env.example` to `client/.env` for local frontend configuration and `server/.env.example` to `server/.env` for local API configuration.

## Local development

Requires Node.js 20+.

```bash
npm install
npm run dev
```

## Current implementation

- Live vehicle catalogue endpoint; only active vehicles are public.
- Public booking creation validates the selected active vehicle and passenger capacity.
- Booking reference + phone based private status lookup.
- Supabase SMS OTP sign-in for pre-provisioned vehicle-owner accounts.
- Owner vehicle registration endpoint; owner must be verified before listing.
- Separate API modules for bookings, owners, vehicles, authentication and Admin identity.

## Remaining launch requirements

Before accepting real public bookings, finish and verify:
1. Admin booking queue, fare quote, customer acceptance, cancellation and audit trail.
2. Driver registration and private driver assignment.
3. Secure vehicle/driver photo upload using Supabase Storage.
4. Database transaction/RPC for conflict-safe assignment and complete RLS/security review.
5. Provision the two Booking Team accounts and verified owner profiles.
6. Configure the Render API URL, Supabase SMS provider, frontend environment and allowed CORS origins.
7. End-to-end testing, monitoring, backup/restore testing and abuse controls.

Free-tier services may sleep, pause or impose quotas. Do not treat this setup as production-reliable until the above checks are complete.
