import Link from "next/link";
import { siteConfig } from "@/lib/config/site";

type Props = { eyebrow: string; title: string; description: string; requirements: string[] };

export function SectionStatus({ eyebrow, title, description, requirements }: Props) {
  return (
    <main className="container-wide py-10 min-h-[70vh]">
      <Link href="/" className="font-bold text-navy">← الرئيسية</Link>
      <p className="text-amber-700 font-bold mt-7">{eyebrow}</p>
      <h1 className="text-4xl font-black text-navy mt-2">{title}</h1>
      <p className="text-slate-600 leading-8 mt-4 max-w-3xl">{description}</p>
      <section className="card p-6 mt-8 max-w-3xl" aria-labelledby="section-state">
        <h2 id="section-state" className="font-black text-xl text-navy">حالة القسم</h2>
        <p className="mt-2 text-slate-700 leading-7">هذا القسم ضمن الخطة المرجعية للمنصة، وتجري تهيئته وربطه بمصادر وبيانات موثوقة. لا تُعرض هنا منتجات أو أسعار أو خدمات غير مثبتة.</p>
        <h3 className="font-bold mt-5">متطلبات الإكمال</h3>
        <ul className="list-disc pr-6 mt-2 space-y-2 text-slate-600">
          {requirements.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
      <section className="mt-7 rounded-2xl bg-navy text-white p-6 max-w-3xl">
        <h2 className="font-black text-xl">تواصل مع {siteConfig.brand}</h2>
        <p className="text-slate-300 mt-2">{siteConfig.address}</p>
        <div className="flex flex-wrap gap-3 mt-4">
          <a className="rounded-lg bg-white text-navy px-4 py-2 font-bold" href={`tel:${siteConfig.phone}`}>اتصال</a>
          <a className="rounded-lg bg-amber-400 text-navy px-4 py-2 font-bold" href={`https://wa.me/${siteConfig.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">واتساب</a>
        </div>
      </section>
    </main>
  );
}
