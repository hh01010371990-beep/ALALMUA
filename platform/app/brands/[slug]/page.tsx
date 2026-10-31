import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
}

export default async function BrandDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return <main className="container-wide py-12"><Link href="/brands" className="font-bold text-navy">← دليل العلامات</Link><h1 className="text-3xl font-black mt-7">صفحة العلامة التجارية</h1><p className="card p-6 mt-5">يلزم إعداد قاعدة البيانات لعرض بيانات العلامات المسجلة. لم نضع معلومات غير موثقة.</p></main>;
  }
  const supabase = await createClient();
  const { data: brands, error } = await supabase.from("brands").select("id,name,description,website,logo_url,official_support_url,facebook_url,instagram_url,tiktok_url");
  if (error || !brands) return <main className="container-wide py-12"><p className="card p-6">تعذر تحميل بيانات العلامة حاليًا.</p></main>;
  const brand = brands.find((item: any) => slugify(item.name) === slug);
  if (!brand) notFound();
  return <main className="container-wide py-10"><Link href="/brands" className="font-bold text-navy">← دليل العلامات</Link><section className="card p-7 mt-7 max-w-4xl"><div className="h-24 flex items-center justify-center bg-slate-50 rounded-xl">{brand.logo_url ? <img src={brand.logo_url} alt={brand.name} className="max-h-20 max-w-full object-contain" /> : <span className="text-3xl font-black text-navy">{brand.name}</span>}</div><h1 className="text-4xl font-black text-navy mt-6">{brand.name}</h1><p className="text-slate-600 leading-8 mt-3">{brand.description || "لم تُسجل معلومات تعريفية إضافية موثقة لهذه العلامة بعد."}</p><div className="flex flex-wrap gap-3 mt-6">{brand.website && <a href={brand.website} target="_blank" rel="noreferrer" className="rounded-lg bg-navy text-white px-4 py-2">الموقع الرسمي</a>}{brand.official_support_url && <a href={brand.official_support_url} target="_blank" rel="noreferrer" className="rounded-lg border px-4 py-2">الدعم الفني</a>}</div><p className="text-sm text-slate-500 mt-6">وجود العلامة في الدليل لا يعني أن جميع منتجاتها أو أسعارها أو ضماناتها قد تم التحقق منها.</p></section></main>;
}
