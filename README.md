# RideYou — Bihar Ride Booking Demo

A mobile-first ride-booking prototype for Bihar, designed around simple customer booking, manual fare approval and driver assignment.

## Live demo (GitHub Pages)

This repository is configured to build and deploy the frontend to GitHub Pages whenever changes are pushed to `main`.

After the first successful workflow run, open:
`https://abhinavcse-er.github.io/RideYou/`

If Pages has not been enabled yet, go to **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Demo features

- Hindi-friendly, responsive customer booking form
- Booking reference and local browser persistence
- Customer booking lookup by mobile number
- Demo admin workflow: review requests, quote fare, see acceptance, assign driver and vehicle
- Demo driver workflow: view assigned trips, start and complete a trip
- Search, status filters and JSON export

## Important demo limitations

**This GitHub Pages version is a frontend-only prototype.** Demo bookings are saved in the current browser's local storage. They do not sync between devices or users. Role switching is for demonstration only and is NOT authentication or authorization. Do not enter real customer information.

The connected Supabase project is not accessed by this static demo. Never put a Supabase service-role/secret key in frontend code or GitHub Pages. Real multi-user bookings, secure admin/driver accounts, database-backed assignments, vehicle conflict prevention, photos, customer-driver chat and masked calling require a secured backend/API and additional database policies before launch.

## Local development

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal (usually http://localhost:5173).

Build the static site:

```bash
npm run build
```

Output: `client/dist`.

## Planned production milestones

1. Secure authentication and role-based API permissions (two invite-only admins, drivers and customers).
2. Supabase-backed booking, quote/acceptance and audit history.
3. Transaction-safe vehicle/driver assignment to prevent double booking.
4. Private driver and vehicle photo storage.
5. Customer-driver chat without exposing personal phone numbers.
6. Backups, restore tests, abuse protection, monitoring and load/security testing.
7. Android app using the same secured backend.

Free-tier hosting and database quotas can pause or limit service; verify current limits and backup options before a public launch.
