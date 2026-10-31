# خارطة التنفيذ

## V7.1 Foundation
- الهيكل
- قاعدة البيانات
- فصل Product Master عن Seller Offers

## V7.2 Authentication & Security
- Supabase Auth
- Roles
- RLS
- Audit Logs

## V7.3 Admin Command Center
- المنتجات
- الشركات
- البائعون
- العملاء
- AI Workforce
- Virtual Home
- Settings

## V7.4 Product & Brand Universe
- كتالوج شامل
- المواصفات
- الصور والفيديو
- الضمان
- الأبعاد
- استهلاك الكهرباء

## V7.5 Multi-Vendor Directory & Offers
- تسجيل البائع ومراجعة طلب الانضمام
- ملف المتجر والعروض
- عرض معلومات المتاجر المعتمدة
- تحديث السعر والمخزون والضمان بواسطة التاجر المعتمد
- تحويل العميل المهتم إلى فريق المبيعات لإتمام البيع خارج المنصة
- لا توجد سلة شراء أو طلبات شراء أو عمولات أو تحصيل أموال داخل المنصة

## V7.6 AI Workforce
- عشرة وكلاء AI
- قاعدة معرفة/RAG
- صلاحيات وإجراءات
- تحويل للموظف البشري

## V7.7 Virtual Home & 3D
- غرف وأبعاد
- وضع المنتجات
- 3D
- AR/WebXR عند اكتمال الأصول

## V7.8 Smart Comparison
- السعر
- الاستخدام
- المساحة
- القدرة
- الطاقة
- الضمان
- التوافق

## بعد V7.8
- CRM
- خدمة ما بعد البيع
- المحتوى والأكاديمية
- المجتمع
- عروض وحملات
- تقارير وإحصائيات
- تكاملات التواصل وخدمة ما بعد البيع
- تطبيق جوال/امتداد PWA
- الدفع الإلكتروني وإتمام الشراء غير مطلوبين ضمن نطاق المنصة الحالي

## Merchant Portal (added)

- `/merchant`: Arabic RTL merchant landing page and onboarding overview.
- `/merchant/apply`: merchant application form; requires an authenticated Supabase user.
- `POST /api/merchant/apply`: validates input server-side and creates a `PENDING` marketplace seller application. It does not permit the applicant to approve their own account.
- `database/migrations/002_merchant_portal.sql`: merchant profile fields, store/offer metadata, product-submission review queue, and RLS policies.
- Home page now links to the merchant portal.

### Before enabling for real merchants
1. Apply `001_core.sql` and then `002_merchant_portal.sql` to the target Supabase project.
2. Review the policies with real admin and seller test accounts; ensure the first admin role is assigned securely.
3. Configure Supabase environment variables and verify email/login flow.
4. Add admin UI for application review and product submission moderation.
5. Add merchant store/offer management UI, product picker, and image storage.
6. Run migrations against a staging database and test RLS for anonymous users, customers, pending sellers, approved sellers, and admins.

The current merchant UI and application endpoint are a foundation, not a complete production marketplace. Public store listings and live offers require implementation and testing. Checkout, payment, purchase orders, commissions, and payout workflows are explicitly out of scope; sales handoff is handled by human sales staff.

### Merchant portal acceptance checklist
- Anonymous visitor can view `/merchant` but cannot submit an application.
- Authenticated customer can submit one application; duplicate applications are rejected.
- Submitted application is `PENDING` and cannot be self-approved by the applicant.
- Public visitors cannot see pending/unapproved stores or offers.
- Only approved seller accounts can manage offers and submit new product requests.
- Only platform admins can review seller applications and activate stores.
- Validate all policies in Supabase staging with separate anonymous, customer, pending-seller, approved-seller, and admin sessions.

## Update — Merchant review workflow

- Added a server-rendered admin access check based on the user's profile role.
- Added an admin API to list merchant applications and a PATCH endpoint to review them.
- Added an Arabic RTL review panel with filters, application details, review notes, approval, rejection, under-review, and suspension actions.
- Added seller status/review-note audit logging in migration 002 and aligned the database admin helper with application admin roles.
- Remaining: apply migrations to a test Supabase project, verify RLS and audit writes, build merchant product/offer management, and run a successful production build.


## Update — Merchant offer management

- Added `/seller` dashboard with approval-state messaging and a product-offer form for approved sellers.
- Added authenticated `GET /api/seller/overview` and `POST /api/seller/offers` endpoints.
- Offer submission validates numeric fields, checks the seller's approval status, upserts by `(product_id, seller_id)`, and records the submitted price source and verification timestamp.
- Remaining: product media uploads, store profile editing, sales-lead follow-up workflow, and end-to-end verification against a configured Supabase test project.


## Update — Merchant store profile

- Added a store profile editor to `/seller` for store name, description, city, address, phone, WhatsApp, logo URL, delivery policy, and return policy.
- Added `GET /api/seller/store` and `PUT /api/seller/store`; both require authentication and an approved marketplace seller.
- Added store-profile columns and a one-store-per-seller unique index to migration 002.
- Store activation remains admin-controlled; saving the profile does not make the store public automatically.
- Remaining: image upload through Supabase Storage, public storefront pages, sales-lead follow-up workflow, and testing against a configured Supabase staging project.


## Scope correction — sales handoff (current)
- Removed cart, checkout, purchase-order, commission, payout, and payment screens/APIs from the application.
- Product cards now collect a customer callback request and store it in `sales_leads`; authorized sales staff can review the queue at `/admin/sales-leads`.
- Added a migration for the sales-lead queue and seed records for ten scoped virtual AI employees.
- Purchase completion happens directly with a human sales employee outside the platform. No online payment is implemented or required.
- Remaining: apply and test migration 003 on a configured Supabase project, confirm sales-team access, configure real business contact details, and verify OpenAI credentials if live AI responses are required.


## Update — Sales follow-up status management
- Added an authenticated PATCH endpoint for updating a sales lead's follow-up status.
- Added a status selector to the sales lead queue for NEW, ASSIGNED, CONTACTED, QUALIFIED, CLOSED, and UNREACHABLE.
- Tightened the public insert policy so public submissions must begin as NEW and cannot assign themselves to a sales employee.
- Revoked direct client UPDATE privileges on sales leads and routed status changes through a security-definer RPC that checks the signed-in user's role.
- Remaining: execute migrations and verify function privileges/RLS against a staging Supabase project; this repository has not been connected to a live project.


## Update — AI workforce administration
- Added `/admin/ai-workforce` for authorized administrators to edit the display name, system instructions, and enabled state of the ten seeded AI roles.
- Added a protected admin API for reading/updating AI agent configuration.
- The AI endpoint now reads the selected active agent's name and system prompt from Supabase when configured; otherwise it uses its built-in scoped prompt.
- Migration 003 enables RLS for AI agent records and restricts management to specified admin roles.
- Remaining: validate admin policies and prompt changes in Supabase staging, configure OpenAI credentials, and add grounded catalog retrieval before presenting answers as product-specific facts.


## V7 — أدوات قرار الشراء وتحويل العميل للمبيعات
- [x] حاسبة استهلاك الكهرباء والتكلفة التقديرية.
- [x] رابط واتساب مباشر قابل للإعداد بعد تسجيل طلب التواصل.
- [x] توثيق عدم وجود شراء أو دفع إلكتروني.
- [ ] إدخال رقم المبيعات الرسمي واختبار رابط واتساب في بيئة النشر.
- [ ] استكمال اختبار البناء الكامل وRLS على مشروع Supabase تجريبي.


## V8 — Smart comparison foundation (implemented in source; staging validation pending)
- [x] Select 2–3 products from the configured catalog.
- [x] Compare recorded price, seller, offer count, warranty, electricity consumption, dimensions, and selected specifications.
- [x] Label missing data rather than inventing values.
- [x] Link comparison from homepage and product listing.
- [ ] Populate the database with verified product specifications and current offers.
- [ ] Run full TypeScript/build checks and test the catalog query with Supabase RLS in staging.


## V9 — Catalog Admin & Data Quality
- Admin product CRUD at `/admin/catalog`; drafts remain hidden from public visitors until explicitly published.
- Brand directory and official-link management at `/brands` and `/admin/catalog`.
- Admin-only image upload endpoint and dedicated Supabase Storage bucket, limited to image MIME types and 5 MB.
- Public catalog filters for category, brand, price range, warranty, and text/specification terms.
- Expose price verification timestamps when available; offer entry API records verification time on each price update.
- Contact handoff uses the company-provided phone 01044111143 and WhatsApp 01050509779; address is Sidi Ghazi, Kafr El Sheikh, in front of the microbus station.
- Required before production: run migrations 001–004 in staging, test role isolation and RLS, verify official brand links, run full dependency install and production build, then deploy with configured environment variables.
