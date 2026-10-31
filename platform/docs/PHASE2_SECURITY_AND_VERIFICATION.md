# Al Hazem Smart v9.1 — Phase 2 changes and verification

## Scope

This working copy contains targeted hardening changes. The uploaded source archive remains unchanged.

## Changes made in this copy

1. Added `lib/security/rate-limit.ts`, a best-effort in-process limiter.
2. Applied a limit of 10 AI requests per client key per minute and 5 sales-lead submissions per client key per 10 minutes.
3. Limited AI output to 700 tokens and the upstream request to 20 seconds.
4. Stopped setting `last_price_verified_at` when a merchant merely submits/updates an offer.
5. The catalog now exposes `priceUpdatedAt` separately from `priceVerifiedAt`; the product UI labels them distinctly and warns when independent verification is absent.
6. Added `.gitignore` to exclude secrets, dependencies, build output, and TypeScript build cache.
7. Added migration `005_sales_lead_input_hardening.sql` to constrain `source` and `notes` at the database layer.

## Important limitations

- The in-memory rate limiter is not a production-grade global limit across serverless instances, restarts, or multiple regions. Configure a shared Redis/Upstash limiter or edge/WAF rate limiting before public production launch.
- The client key uses platform request headers. Confirm the hosting provider overwrites/sanitizes forwarded-IP headers; otherwise use a trusted provider-specific client-IP header.
- This migration has not been run against a live Supabase project. Back up the database and test it in staging first.
- Migration 005 clears `last_price_verified_at` for `merchant_portal` offers because the previous endpoint populated it automatically on merchant submission. Back up first; the original timestamp values cannot be recovered from the application after clearing.
- No live OpenAI or Supabase credentials are available in this workspace; end-to-end requests cannot be verified here.

## Verification status

- Static source review: performed.
- Rate-limiter unit smoke test: passed (first two requests allowed, third blocked, new window resets).
- Dependency install: timed out; dependencies remain unavailable.
- TypeScript full check: blocked by missing Next.js/React/Supabase/Zod and Node type dependencies; no TypeScript parser diagnostics (TS1xxx) were observed, but this is not a successful type-check.
- Production build: not run successfully because dependencies could not be installed.
- Database migration execution and RLS behavior: pending staging verification.
- Rate-limit behavior under multiple instances: not proven by the local implementation.

## Required staging tests

1. Send 11 AI requests from one client key within a minute; the 11th should return 429 and a Retry-After header.
2. Send 6 sales-lead submissions from one client key within ten minutes; the 6th should return 429.
3. Confirm malformed JSON and invalid schemas return 400.
4. Confirm AI timeout returns 504 and upstream non-2xx returns 502.
5. Submit a seller offer and verify `updated_at` changes while `last_price_verified_at` is not newly set.
6. Verify the catalog displays update date and independent-verification status separately.
7. Attempt direct Supabase inserts with an invalid `source`, excessive `notes`, non-NEW status, or assigned user; each should be rejected by constraints/RLS.
8. Confirm approved sellers can manage only their own offers and public users cannot read leads.
9. Run `npm ci`, `npm run lint`, and `npm run build` in a clean environment and record outputs.
