# Al Hazem platform implementation status

## Implemented in this source package
- Arabic RTL landing page and product catalog backed by Supabase when configured.
- Product offers displayed as information; there is no cart, checkout, online payment, purchase-order system, commission settlement, or payout flow.
- Customer callback request form records a sales lead. The sales team follows up outside the platform to complete any sale.
- Protected sales-lead queue at `/admin/sales-leads`, click-to-call link, and status progression: NEW, ASSIGNED, CONTACTED, QUALIFIED, CLOSED, UNREACHABLE.
- Sales-lead status updates use a role-checked API and PostgreSQL RPC; direct client UPDATE permission is revoked in migration 003.
- Ten scoped virtual employee roles and `/experts` conversational UI. When Supabase is configured, the runtime uses the selected active employee's saved name and system prompt.
- Admin employee management at `/admin/ai-workforce` for authorized roles to edit the name/instructions and enable or disable an agent.
- Merchant onboarding, review, store profile, and offer-management foundation.

## Required external setup and verification
1. Configure `.env.local` from `.env.example` with a real Supabase project.
2. Apply migrations in order: `001_core.sql`, `002_merchant_portal.sql`, `003_sales_handoff_ai_workforce.sql`, `004_catalog_admin_security.sql`, then `database/seeds/001_reference.sql`.
3. Assign the first administrator securely and test RLS using anonymous, customer, sales, seller, and admin accounts.
4. Add `OPENAI_API_KEY` for live AI responses; without it the endpoint returns a demo-mode response.
5. Add verified product/brand records, official company links, real product images, and approved current offers.
6. Test deployment build and workflows in staging before production.

## Verification in this workspace
- ZIP integrity check: required after packaging.
- TypeScript compiler was invoked, but dependencies could not be installed within the available time; therefore a full TypeScript/build pass is not confirmed.
- No live Supabase project or production deployment was available for end-to-end testing.


## V7 additions
- Interactive Arabic electricity-use estimator at `/energy-calculator`; estimates monthly kWh and cost from user-entered wattage, hours/day, days/month, device count, and price per kWh.
- Sales contact form now offers a direct WhatsApp handoff after successfully recording a lead, provided `NEXT_PUBLIC_SALES_WHATSAPP` is configured with the official business number in international digits-only format. No invented company contact number is embedded.
- Fixed an extra closing brace in the sales lead queue JSX found during syntax validation.
- Validation in this workspace: TypeScript/TSX syntax transpilation passed for 40 source files. Full `tsc`/Next.js build is not confirmed because project dependencies are not installed; `tsc` reported missing modules/types as expected in this uninstalled workspace.

## V8 additions
- Replaced the static comparison placeholder with an interactive `/compare` tool. A visitor can select two or three catalog products and compare available prices, seller with the lowest offer, offer count, warranty, registered electricity consumption, dimensions, and selected text specifications.
- Extended `GET /api/catalog` to return the fields required by comparison, including product specifications and the brand website when recorded.
- Missing specifications are labelled as unavailable rather than inferred. Lowest-price highlighting only compares the currently returned offers and is not a quality recommendation.
- Added comparison entry points on the homepage and product listing page.
- Changed the `lint` package script to `tsc --noEmit` for compatibility with Next.js 15 projects where `next lint` may not be available.
- Syntax-only transpilation passed for 41 TypeScript/TSX files with zero syntax diagnostics. Full type checking and Next.js build remain unverified because project dependencies are not installed; Supabase queries and RLS require staging tests.

## V9 additions
- Added protected catalog administration at `/admin/catalog`: product create/edit/delete, draft/publish status, model/SKU, dimensions, electricity use, warranty, description, extra specifications, and primary image management.
- Added an admin-only upload endpoint with MIME type and 5 MB limits; images use the dedicated `alhazem-product-media` Supabase Storage bucket and RLS policies.
- Added brand create/edit/delete and management of official website, support URL, logo URL, and Facebook/Instagram/TikTok links. Public directory is available at `/brands`.
- Added product-list filters for category, brand, price range, warranty, and specifications. Available seller offers expose the last price verification/update date when available.
- Added catalog audit triggers for product and brand changes. Migration 004 must be applied after migrations 001–003.
- Configured company-provided contacts: phone 01044111143, WhatsApp 01050509779, address محافظة كفر الشيخ، مدينة سيدي غازي، أمام موقف الميكروباص.
- TypeScript/TSX syntax transpilation passed for 47 source files with zero syntax diagnostics. A full compiler/build run is not confirmed because package installation timed out; dependencies are not installed in this workspace. No live Supabase RLS, upload, or CRUD test has been performed.


## V9.1 setup handoff
- Added `docs/SETUP_AND_TESTING_AR.md` with environment setup, migration order, secure first-admin bootstrap, local commands, and pre-deployment smoke tests.
- This is an operational guide; it does not mean the user's external Supabase project has been configured or deployed.

## v10 reference-aligned build workstream
- Added a centralized company identity/contact configuration in `lib/config/site.ts`, using the master reference's phone `01050509779` and WhatsApp `01044111143` as defaults. Homepage and brand directory now consume the centralized values.
- Added explicit routes for offers, news, tips, academy, transparency, AUX, air-conditioning, smart kitchen, lighting/antiques, FAQ, club, community, support, profile, and a separate air-conditioner capacity calculator route. These routes are honest readiness pages and do not imply that unbuilt workflows are live.
- Added a dynamic internal brand page at `/brands/[slug]` based on registered brand records.
- Added actual 404 page, `robots.ts`, `sitemap.ts`, and homepage links for the reference sections. AUX appears immediately before the homepage footer.
- Updated environment/setup documentation and migration order to include migration 005.
- Added `npm run verify:reference` for structural checks.
- Current verification: `node scripts/verify-reference.mjs` passed. Full TypeScript/build, live Supabase/RLS, storage, AI, and production tests are not yet confirmed.
- No existing application route or database table was intentionally removed. No live database schema was changed in this workstream.
