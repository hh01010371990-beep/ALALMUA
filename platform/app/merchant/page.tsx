import Link from "next/link";
import { ArrowLeft, BadgeCheck, ClipboardList, PackagePlus, Store, TrendingUp, Users } from "lucide-react";

const features = [
  { icon: ClipboardList, title: "قدّم طلب الانضمام", desc: "سجّل بيانات نشاطك التجاري ليتمكن فريق الحازم من مراجعتها." },
  { icon: Store, title: "أنشئ واجهة متجرك", desc: "عرّف العملاء باسم متجرك ونشاطك ومعلومات التواصل بعد الاعتماد." },
  { icon: PackagePlus, title: "أضف منتجاتك وعروضك", desc: "اربط عرضك بمنتج موجود في الكتالوج أو اطلب إضافة منتج جديد." },
  { icon: TrendingUp, title: "تابع عروضك", desc: "جهّز لإدارة الأسعار والمخزون والتوصيل والضمان من مكان واحد." },
];

export default function MerchantPortalPage() {
  return <main className="min-h-screen">
    <header className="bg-navy text-white">
      <div className="gold-line" />
      <div className="container-wide py-10">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-300 hover:text-white"><ArrowLeft size={17}/> الرئيسية</Link>
        <div className="grid lg:grid-cols-[1.4fr_.6fr] gap-10 items-center py-10">
          <div>
            <p className="text-gold font-bold mb-3">بوابة التجار · Al Hazem Marketplace</p>
            <h1 className="text-4xl md:text-5xl font-black leading-tight">اعرض منتجاتك لعملاء الحازم</h1>
            <p className="text-slate-300 text-lg leading-8 mt-5 max-w-2xl">انضم إلى سوق الحازم لعرض منتجات الأجهزة الكهربائية والتكييف والأدوات المنزلية والنجف والديكور. بعد مراجعة طلبك، يمكنك تجهيز متجرك وعروضك وفق قواعد المنصة.</p>
            <div className="flex flex-wrap gap-3 mt-7">
              <Link href="/merchant/apply" className="rounded-xl bg-gold text-navy px-6 py-3 font-black inline-flex items-center gap-2">قدّم طلب الانضمام <ArrowLeft size={18}/></Link>
              <a href="#how-it-works" className="rounded-xl border border-white/25 px-6 py-3 font-bold">كيف تعمل البوابة؟</a>
              <Link href="/seller" className="rounded-xl border border-white/25 px-6 py-3 font-bold">لوحة التاجر</Link>
            </div>
          </div>
          <div className="rounded-3xl bg-white/5 border border-white/10 p-7">
            <Store size={42} className="text-gold mb-5" />
            <h2 className="text-2xl font-black">سوق منظم وشفاف</h2>
            <ul className="mt-5 space-y-4 text-slate-200 leading-7">
              <li className="flex gap-3"><BadgeCheck className="text-gold shrink-0 mt-1"/> مراجعة بيانات المتاجر قبل إظهارها للعملاء.</li>
              <li className="flex gap-3"><BadgeCheck className="text-gold shrink-0 mt-1"/> فصل بيانات المنتج عن سعر كل تاجر ومخزونه.</li>
              <li className="flex gap-3"><BadgeCheck className="text-gold shrink-0 mt-1"/> إتاحة مقارنة العروض على المنتج نفسه.</li>
            </ul>
          </div>
        </div>
      </div>
    </header>

    <section className="container-wide py-14" id="how-it-works">
      <div className="max-w-2xl mb-8"><p className="text-gold font-bold">خطوات الانضمام</p><h2 className="text-3xl font-black text-navy mt-2">من التسجيل إلى عرض المنتجات</h2><p className="text-slate-600 mt-3 leading-7">تُراجع الإدارة الطلب أولًا. لا يظهر المتجر أو عرضه للجمهور قبل الاعتماد والمراجعة المطلوبة.</p></div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {features.map(({icon: Icon, title, desc}, i) => <article className="card p-6" key={title}><div className="flex items-center justify-between mb-5"><Icon className="text-gold" size={30}/><span className="text-sm font-black text-slate-400">0{i+1}</span></div><h3 className="font-black text-lg text-navy">{title}</h3><p className="text-slate-600 leading-7 mt-2">{desc}</p></article>)}
      </div>
    </section>

    <section className="bg-white border-y py-12">
      <div className="container-wide grid md:grid-cols-2 gap-8 items-center">
        <div><Users className="text-gold mb-4" size={34}/><h2 className="text-3xl font-black text-navy">من يستطيع الانضمام؟</h2><p className="text-slate-600 leading-8 mt-3">متاجر الأجهزة الكهربائية، وموزعو العلامات التجارية، وتجار الأدوات المنزلية والمطبخ، والنجف والإضاءة والديكور، ومقدمو الخدمات ذات الصلة. قد تطلب الإدارة مستندات إضافية بحسب النشاط.</p></div>
        <div className="card p-6"><h3 className="font-black text-xl text-navy">قبل تقديم الطلب</h3><ul className="list-disc pr-5 mt-4 space-y-2 text-slate-600 leading-7"><li>جهّز بيانات النشاط ووسيلة تواصل يمكن الوصول إليها.</li><li>اكتب وصفًا واضحًا للفئات التي تبيعها.</li><li>تأكد من دقة الأسعار والمخزون والضمان عند إدراج العروض.</li><li>لا ترفع بيانات عملاء أو مستندات لا تخص نشاطك.</li></ul><Link href="/merchant/apply" className="mt-6 inline-flex items-center gap-2 text-navy font-black">ابدأ طلبك <ArrowLeft size={17}/></Link></div>
      </div>
    </section>
    <footer className="container-wide py-8 text-center text-sm text-slate-500">بوابة التجار — منصة الحازم جروب</footer>
  </main>;
}
