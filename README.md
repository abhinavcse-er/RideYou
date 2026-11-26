# RideYou

A mobile-first ride booking platform for Bihar, starting with Bettiah and nearby towns.

## Stack
- React + Vite customer website
- Node.js + Express API
- Supabase PostgreSQL database
- Planned hosting: Netlify + Render + Supabase

## Local setup
1. Install Node.js 20 or newer.
2. Run `npm install` in the repository root.
3. Copy `server/.env.example` to `server/.env`.
4. Add your Supabase project URL and service-role key to `server/.env`.
5. Run `npm run dev`; open http://localhost:5173.

The API listens on http://localhost:4000.

## Database setup
Run `supabase/schema.sql` in Supabase SQL Editor. The API intentionally refuses booking writes until its server-side Supabase credentials are configured.

## Security
- Never commit `.env` or expose the Supabase service-role key in browser code.
- Customer booking data is not publicly readable.
- Admin accounts must be invite-only.
- Driver personal phone numbers must never be exposed to customers.
- Implement authorization on the API and database, not only in the UI.
- Add transactional vehicle assignment before dispatch is enabled.

## Milestones
1. Customer booking form and private booking API/schema.
2. Admin login, quote/acceptance flow, audit history.
3. Driver dashboard, secure assignment, vehicle availability checks.
4. Driver/vehicle photo uploads and customer trip status.
5. Database-backed customer-driver chat without revealing personal phone numbers.
6. Deployment, backups, restore tests, and load/security testing.

Free-tier services can sleep, have quotas, and may not provide production-grade backups or 24/7 availability. Review limits before launch.
