import Link from "next/link";
import { ArrowLeft, Bot, Boxes, Home, Search, ShieldCheck, Store, PhoneCall, Calculator, BookOpen, Newspaper, Lightbulb, BadgeCheck } from "lucide-react";
import { siteConfig, whatsappUrl } from "@/lib/config/site";

const brands = [
  ["AUX", "تكييفات وحلول تبريد"],
  ["LG", "أجهزة منزلية وتقنيات ذكية"],
  ["SHARP", "أجهزة منزلية"],
  ["TOSHIBA", "ثلاجات وغسالات وأجهزة منزلية"],
  ["Carrier", "حلول تكييف"],
];

const categories = [
  "التكييفات",
  "الأجهزة المنزلية الكبرى",
  "الأجهزة الصغيرة",
  "أدوات المطبخ والسفرة",
  "أطقم الطهي والجرانيت",
  "النجف والإضاءة",
  "الديكور والتحف",
  "الخدمات والصيانة"
];

export default function HomePage() {
  return (
    <main>
      <header className="bg-navy text-white">
        <div className="gold-line" />
        <div className="container-wide py-16">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-gold font-bold mb-3">مجموعة العالمية × منصة الحازم</p>
              <h1 className="text-4xl md:text-6xl font-black leading-tight">
                المرجع الذكي للبيت العصري
              </h1>
              <p className="mt-5 max-w-3xl text-slate-300 text-lg leading-8">
                منصة لا تكتفي بعرض المنتجات؛ تساعد العميل على فهم المنتج ومقارنته واختيار المناسب
                لمساحته وميزانيته واستخدامه، مع تحويل العميل مباشرةً إلى فريق المبيعات عند استعداده للشراء؛ لا يوجد دفع أو إتمام شراء داخل المنصة.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/products" className="rounded-xl bg-gold text-navy px-6 py-3 font-bold flex items-center gap-2">
                ابدأ استكشاف المنتجات <ArrowLeft size={18}/>
              </Link>
              <Link href="/experts" className="rounded-xl border border-white/30 text-white px-6 py-3 font-bold flex items-center gap-2">
                الموظفون الافتراضيون <Bot size={18}/>
              </Link>
              <Link href="/merchant" className="rounded-xl border border-white/30 text-white px-6 py-3 font-bold flex items-center gap-2">
                بوابة التجار <Store size={18}/>
              </Link>
              <Link href="/compare" className="rounded-xl border border-white/30 text-white px-6 py-3 font-bold flex items-center gap-2">
                قارن المنتجات <Boxes size={18}/>
              </Link>
              <Link href="/brands" className="rounded-xl border border-white/30 text-white px-6 py-3 font-bold flex items-center gap-2">
                دليل العلامات الرسمية <Store size={18}/>
              </Link>
              <Link href="/products" className="rounded-xl border border-white/30 text-white px-6 py-3 font-bold flex items-center gap-2">
                تواصل مع المبيعات <PhoneCall size={18}/>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="container-wide py-12">
        <div className="grid md:grid-cols-4 gap-5">
          {[
            [Bot, "اسأل خبير العالمية", "مساعد ذكي لفهم المنتج والاختيار."],
            [Boxes, "مقارنة ذكية", "مقارنة حسب الاستخدام والسعر والمساحة والطاقة."],
            [Home, "المنزل الافتراضي", "تصور المنتجات داخل غرف ومساحات حقيقية."],
            [Store, "سوق متعدد البائعين", "بوابة مخصصة للتجار لتقديم طلبات الانضمام وتجهيز المتاجر والعروض."]
          ].map(([Icon, title, desc]) => (
            <div className="card p-6" key={title as string}>
              <Icon className="text-gold mb-4" size={30}/>
              <h2 className="font-black text-xl mb-2">{title as string}</h2>
              <p className="text-slate-600 leading-7">{desc as string}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border-y py-12">
        <div className="container-wide">
          <div className="flex items-end justify-between gap-4 mb-7">
            <div>
              <p className="text-gold font-bold">الكتالوج</p>
              <h2 className="text-3xl font-black text-navy">الأقسام الرئيسية</h2>
            </div>
            <Link href="/products" className="text-navy font-bold flex gap-2 items-center">كل المنتجات <ArrowLeft size={17}/></Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map(c => <Link key={c} href="/products" className="card p-5 hover:-translate-y-1 transition"><span className="font-bold">{c}</span></Link>)}
          </div>
        </div>
      </section>

      <section className="container-wide py-12">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-7"><h2 className="text-3xl font-black text-navy">الشركات والعلامات المرجعية</h2><Link href="/brands" className="font-bold text-amber-800 underline">عرض دليل العلامات وروابطها الرسمية</Link></div>
        <div className="grid md:grid-cols-5 gap-4">
          {brands.map(([name, desc]) => (
            <div className="card p-5" key={name}>
              <div className="w-12 h-12 rounded-full bg-navy text-gold grid place-items-center font-black mb-4">{name[0]}</div>
              <h3 className="font-black text-lg">{name}</h3>
              <p className="text-sm text-slate-500 mt-2">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-navy text-white">
        <div className="container-wide py-14 grid md:grid-cols-3 gap-6">
          <Link href="/energy-calculator" className="rounded-2xl border border-white/10 p-5 hover:border-gold transition"><Calculator className="text-gold mb-3"/><h3 className="font-black text-xl">حاسبة استهلاك الكهرباء</h3><p className="text-slate-300 mt-2">احسب الاستهلاك والتكلفة الشهرية التقديرية لأي جهاز.</p><span className="inline-flex items-center gap-2 mt-4 text-gold font-bold">افتح الحاسبة <ArrowLeft size={16}/></span></Link>
          <div><Search className="text-gold mb-3"/><h3 className="font-black text-xl">بحث وفلاتر ذكية</h3><p className="text-slate-300 mt-2">الوصول للمنتج بناءً على المواصفات والاستخدام.</p></div>
          <div><ShieldCheck className="text-gold mb-3"/><h3 className="font-black text-xl">جودة وسجل تدقيق</h3><p className="text-slate-300 mt-2">تصميم قاعدة البيانات يدعم الأدوار والصلاحيات والتدقيق.</p></div>
        </div>
      </section>

      <section className="container-wide py-12">
        <div className="card p-7 md:p-9 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div><p className="text-gold font-bold">لأصحاب المتاجر والشركات</p><h2 className="text-2xl font-black text-navy mt-2">اعرض منتجاتك على منصة الحازم</h2><p className="text-slate-600 mt-2 leading-7">قدّم طلب الانضمام، وبعد المراجعة جهّز متجرك وعروضك.</p></div>
          <Link href="/merchant" className="shrink-0 rounded-xl bg-navy text-white px-6 py-3 font-bold inline-flex items-center gap-2">الدخول إلى بوابة التجار <ArrowLeft size={18}/></Link>
        </div>
      </section>

      <section className="container-wide py-12">
        <div className="flex items-end justify-between gap-4 mb-7"><div><p className="text-gold font-bold">المعرفة والشفافية</p><h2 className="text-3xl font-black text-navy">معلومات تساعدك على الاختيار</h2></div><a href="/transparency" className="font-bold text-amber-800 underline">منهج الشفافية</a></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/news" className="card p-5"><Newspaper className="text-gold mb-3"/><h3 className="font-black">الأخبار</h3><p className="text-sm text-slate-500 mt-2">أخبار بمصادر وتواريخ واضحة.</p></Link>
          <Link href="/tips" className="card p-5"><Lightbulb className="text-gold mb-3"/><h3 className="font-black">النصائح</h3><p className="text-sm text-slate-500 mt-2">إرشادات للاستخدام والاختيار.</p></Link>
          <Link href="/academy" className="card p-5"><BookOpen className="text-gold mb-3"/><h3 className="font-black">الأكاديمية</h3><p className="text-sm text-slate-500 mt-2">تعلم قبل اتخاذ قرار الشراء.</p></Link>
          <Link href="/transparency" className="card p-5"><BadgeCheck className="text-gold mb-3"/><h3 className="font-black">الشفافية</h3><p className="text-sm text-slate-500 mt-2">مصادر البيانات وحالة التحقق.</p></Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <Link href="/offers" className="card p-4 font-bold">العروض</Link>
          <Link href="/kitchen" className="card p-4 font-bold">المطبخ الذكي</Link>
          <Link href="/lighting" className="card p-4 font-bold">النجف والإضاءة</Link>
          <Link href="/faq" className="card p-4 font-bold">الأسئلة الشائعة</Link>
          <Link href="/community" className="card p-4 font-bold">مجتمع العملاء</Link>
          <Link href="/club" className="card p-4 font-bold">نادي الحازم</Link>
          <Link href="/support" className="card p-4 font-bold">خدمة العملاء</Link>
          <Link href="/air-conditioner-calculator" className="card p-4 font-bold">حاسبة قدرة التكييف</Link>
        </div>
      </section>

      <section className="bg-white border-y py-10">
        <div className="container-wide flex flex-wrap items-center justify-between gap-5"><div><p className="text-gold font-bold">AUX</p><h2 className="text-2xl font-black text-navy">مركز AUX للتكييف</h2><p className="text-slate-600 mt-2">معلومات المنتجات والخدمات وفق المصادر والمستندات المتاحة.</p></div><Link href="/aux" className="rounded-xl bg-navy text-white px-5 py-3 font-bold">استكشف قسم AUX <ArrowLeft size={17} className="inline"/></Link></div>
      </section>

      <footer className="bg-[#07111f] text-slate-300 py-8">
        <div className="container-wide grid md:grid-cols-3 gap-5 items-start">
          <div><h2 className="font-black text-white text-lg">تواصل مع العالمية</h2><p className="mt-2 text-sm leading-7">{siteConfig.address}</p></div>
          <div className="flex flex-col gap-3"><a className="font-bold text-gold" href={`tel:${siteConfig.phone}`}>اتصال: {siteConfig.phone}</a><a className="font-bold text-gold" href={whatsappUrl()} target="_blank" rel="noreferrer">واتساب: {siteConfig.whatsapp}</a></div>
          <p className="text-sm">منصة الحازم — العالمية للأجهزة الكهربائية وخدمات التكييف والأدوات المنزلية والنجف © 2026</p>
        </div>
      </footer>
    </main>
  );
}