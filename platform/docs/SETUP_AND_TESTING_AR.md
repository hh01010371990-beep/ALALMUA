# دليل تشغيل واختبار منصة الحازم V9.1

هذا الدليل يجهز النسخة للاختبار على جهازك ومشروع Supabase الخاص بك. لا يتضمن نشرًا تلقائيًا أو اتصالًا بحساب خارجي.

## 1) المتطلبات

- Node.js 22 LTS أو إصدار متوافق مع Next.js 15.
- حساب Supabase ومشروع جديد/اختباري.
- Terminal داخل مجلد المشروع.

## 2) إعداد متغيرات البيئة

1. انسخ `.env.example` إلى `.env.local`.
2. من إعدادات مشروع Supabase انسخ **Project URL** و**anon/public key** إلى المتغيرين التاليين:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_COMPANY_ADDRESS=سيدي غازي، كفر الشيخ، مصر — أمام موقف الميكروباص
NEXT_PUBLIC_SALES_PHONE=01050509779
NEXT_PUBLIC_SALES_WHATSAPP=01044111143 # رقم محلي؛ يحول الرابط تلقائيًا إلى صيغة مصر الدولية
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
OPENAI_API_KEY=
```

- لا تضع `service_role` أو أي مفتاح سري في متغير يبدأ بـ `NEXT_PUBLIC_` أو داخل ملفات الواجهة.
- `OPENAI_API_KEY` اختياري للمحادثة الذكية الحقيقية؛ اتركه فارغًا إن لم تكن ستختبرها الآن.

## 3) تطبيق قاعدة البيانات بالترتيب

من لوحة Supabase افتح **SQL Editor**، وشغّل محتوى ملف واحد في كل مرة، بهذا الترتيب:

1. `database/migrations/001_core.sql`
2. `database/migrations/002_merchant_portal.sql`
3. `database/migrations/003_sales_handoff_ai_workforce.sql`
4. `database/migrations/004_catalog_admin_security.sql`
5. `database/migrations/005_sales_lead_input_hardening.sql`
6. `database/seeds/001_reference.sql`

تحقق من نتيجة كل تشغيل قبل الانتقال إلى الملف التالي. نفّذ ذلك أولًا في مشروع اختبار، وليس قاعدة إنتاج تحتوي بيانات مهمة.

## 4) إنشاء حساب الإدارة الأول

1. من Supabase افتح **Authentication → Users** وأنشئ حسابًا بالبريد وكلمة مرور قوية.
2. انسخ UUID الخاص بالحساب من قائمة المستخدمين.
3. في SQL Editor نفّذ الاستعلام التالي بعد استبدال `PUT_AUTH_USER_UUID_HERE` بالـ UUID الحقيقي، واستبدال الاسم إن أردت:

```sql
insert into public.profiles (id, full_name, role)
values ('PUT_AUTH_USER_UUID_HERE'::uuid, 'Platform Administrator', 'SUPER_ADMIN')
on conflict (id) do update
set role = 'SUPER_ADMIN', full_name = excluded.full_name;
```

لا تشارك UUID أو كلمة المرور علنًا. امنح دور الإدارة فقط لحساب موثوق. إنشاء الحساب وحده لا يمنحه صلاحيات الإدارة؛ يلزم وجود سجل `profiles` بالدور الصحيح.

## 5) التشغيل المحلي

من جذر المشروع:

```bash
npm install
npm run dev
```

ثم افتح `http://localhost:3000`.

للتأكد من جاهزية الإنتاج محليًا بعد تثبيت الحزم:

```bash
npm run lint
npm run build
```

## 6) قائمة اختبار قبل النشر

- افتح الصفحة الرئيسية و`/products` و`/brands` و`/compare`.
- سجّل الدخول بحساب الإدارة، ثم افتح `/admin/catalog`.
- أضف منتجًا تجريبيًا كمسودة، ثم عدّل بياناته، وارفع صورة أقل من 5 MB من نوع JPEG أو PNG أو WebP أو AVIF.
- انشر المنتج وتأكد من ظهوره في الكتالوج العام، ثم ألغِ النشر وتأكد من عدم ظهوره للعامة.
- أضف علامة تجارية تجريبية مع رابط رسمي، وتحقق من ظهورها في `/brands`.
- جرّب حساب عميل عادي: يجب ألا يستطيع فتح أدوات الإدارة أو تعديل المنتجات والعلامات أو رفع الصور.
- تحقق من أن روابط الاتصال وواتساب تستخدم بيانات الشركة الصحيحة.
- اختبر سجل التغييرات في `audit_logs` بعد إنشاء منتج/علامة وتعديلهما وحذفهما.
- اختبر نموذج طلب التواصل وتحويل العميل إلى فريق المبيعات.
- لا توجد سلة شراء أو صفحة دفع إلكتروني؛ إتمام البيع يكون خارج المنصة بواسطة فريق المبيعات.

## 7) ما لم يتم التحقق منه تلقائيًا

لا يمكن تأكيد اتصال Supabase، وسياسات RLS، ورفع الصور، أو نجاح البناء النهائي قبل توفير مشروع Supabase فعلي وتشغيل `npm install` والاختبارات عليه. إذا فشل تثبيت الحزم، راجع اتصال الشبكة وسجل npm ثم أعد المحاولة. لا تنشر المنصة للإنتاج قبل اجتياز قائمة الاختبار أعلاه.
