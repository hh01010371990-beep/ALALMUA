insert into brands (name, description, website) values
('AUX', 'تكييفات وحلول تبريد', null),
('LG', 'أجهزة منزلية وتقنيات ذكية', 'https://www.lg.com/eg'),
('SHARP', 'أجهزة منزلية — أضف رابط الموقع المحلي بعد التحقق', null),
('TOSHIBA', 'أجهزة منزلية وخدمة العملاء في مصر', 'https://www.toshiba-lifestyle.com/eg-ar'),
('Carrier', 'أنظمة تكييف — أضف رابط السوق المحلي بعد التحقق', null)
on conflict (name) do nothing;

insert into categories (name, slug) values
('التكييفات','air-conditioning'),
('الأجهزة المنزلية الكبرى','major-home-appliances'),
('الأجهزة الصغيرة','small-appliances'),
('أدوات المطبخ والسفرة','kitchen-dining'),
('أطقم الطهي','cookware'),
('النجف والإضاءة','lighting'),
('الديكور والتحف','decor'),
('الخدمات والصيانة','services')
on conflict (slug) do nothing;

insert into ai_agents (code, name, system_prompt, knowledge_scope, allowed_actions) values
('AI-01','مستشار المبيعات','ساعد العميل على تحديد احتياجه قبل اقتراح المنتجات.','["products","offers","categories"]','["recommend","compare","handoff"]'),
('AI-02','خبير المنتجات','اشرح المواصفات المتاحة دون اختلاق بيانات.','["product_master","specifications"]','["explain","compare"]'),
('AI-03','مهندس التكييف','ساعد في أسئلة المساحة والقدرة والتركيب مع إحالة الحالات الفنية.','["hvac","installation"]','["estimate","handoff"]'),
('AI-04','مستشار تجهيز المنزل','ساعد في توزيع المنتجات حسب الغرف والمساحات.','["virtual_home","products"]','["design","suggest"]'),
('AI-05','محلل المقارنة','أنشئ مقارنة منظمة بين المنتجات حسب معايير محددة.','["products","offers"]','["compare"]'),
('AI-06','خدمة العملاء','تعامل مع الاستفسارات وتحويل الحالات للبشر عند الحاجة.','["orders","customers"]','["support","handoff"]'),
('AI-07','مدير المحتوى','يساعد في تنظيم المحتوى والبيانات الوصفية.','["content"]','["draft"]'),
('AI-08','محلل البيانات','يحلل مؤشرات المنتجات والمبيعات.','["analytics"]','["analyze"]'),
('AI-09','مصمم المنزل الافتراضي','يقترح مواضع المنتجات داخل الغرف.','["virtual_home","3d_models"]','["design"]'),
('AI-10','مراقب جودة السوق','يراجع عروض البائعين وقواعد الجودة.','["sellers","offers"]','["review","flag"]')
on conflict (code) do nothing;
-- Verified official regional sites; administrators should re-check links periodically.
insert into brands (name, description, website) values
('Beko Egypt', 'الأجهزة المنزلية في مصر', 'https://www.beko.com/eg-ar'),
('Miraco', 'حلول التكييف والتبريد في مصر', 'https://miraco.com.eg/')
on conflict (name) do nothing;
