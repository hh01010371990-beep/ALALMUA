"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeftRight, Package, PhoneCall, Search } from "lucide-react";

type Offer = { id: string; price: number; warrantyMonths: number | null; sellerName: string };
type Spec = { key: string; value: string };
type Product = { id: string; name: string; slug: string; description: string | null; brand?: string; category?: string; brandWebsite?: string | null; image: string | null; offers: Offer[]; widthCm: number | null; heightCm: number | null; depthCm: number | null; electricityConsumption: number | null; warrantyMonths: number | null; specifications: Spec[] };
const unavailable = "غير متوفر بالبيانات الحالية";
const money = (v: number | null | undefined) => v == null || !Number.isFinite(v) ? unavailable : `${v.toLocaleString("ar-EG")} ج.م`;
function specValue(p: Product, key: string) { const s = p.specifications.find(x => x.key.trim().toLowerCase() === key.toLowerCase()); return s?.value || unavailable; }
export default function ComparisonTool() {
  const [products, setProducts] = useState<Product[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [query, setQuery] = useState(""); const [chosen, setChosen] = useState<string[]>([]);
  useEffect(() => { let alive = true; fetch("/api/catalog").then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.message || "تعذر تحميل الكتالوج"); if (alive) { setProducts(d.products || []); if (!d.configured) setError(d.message || "يلزم إعداد قاعدة البيانات"); } }).catch(e => { if (alive) setError(e instanceof Error ? e.message : "تعذر تحميل المنتجات"); }).finally(() => { if (alive) setLoading(false); }); return () => { alive = false; }; }, []);
  const filtered = useMemo(() => products.filter(p => `${p.name} ${p.brand || ""} ${p.category || ""}`.toLocaleLowerCase("ar-EG").includes(query.toLocaleLowerCase("ar-EG"))), [products, query]);
  const selected = chosen.map(id => products.find(p => p.id === id)).filter((p): p is Product => Boolean(p));
  function toggle(id: string) { setChosen(old => old.includes(id) ? old.filter(x => x !== id) : old.length < 3 ? [...old, id] : old); }
  const bestPrice = selected.length ? Math.min(...selected.map(p => p.offers.length ? Math.min(...p.offers.map(o => o.price)) : Number.POSITIVE_INFINITY)) : Number.POSITIVE_INFINITY;
  const rows: { label: string; value: (p: Product) => string; winner?: (p: Product) => boolean }[] = [
    { label: "العلامة التجارية", value: p => p.brand || unavailable },
    { label: "القسم", value: p => p.category || unavailable },
    { label: "أقل سعر معلن", value: p => p.offers.length ? money(Math.min(...p.offers.map(o => o.price))) : "اطلب السعر من المبيعات", winner: p => p.offers.length > 0 && Math.min(...p.offers.map(o => o.price)) === bestPrice },
    { label: "البائع صاحب أقل سعر", value: p => p.offers.length ? p.offers.reduce((a,b) => a.price <= b.price ? a : b).sellerName : unavailable },
    { label: "العرض المتاح", value: p => p.offers.length ? `${p.offers.length.toLocaleString("ar-EG")} عرض/عروض` : "لا يوجد عرض منشور" },
    { label: "الضمان", value: p => p.warrantyMonths != null ? `${p.warrantyMonths} شهرًا` : p.offers.find(o => o.warrantyMonths != null)?.warrantyMonths != null ? `${p.offers.find(o => o.warrantyMonths != null)?.warrantyMonths} شهرًا حسب العرض` : unavailable },
    { label: "استهلاك الكهرباء (حسب البيانات المسجلة)", value: p => p.electricityConsumption == null ? unavailable : `${p.electricityConsumption} كيلووات/ساعة` },
    { label: "الأبعاد (عرض × ارتفاع × عمق)", value: p => [p.widthCm, p.heightCm, p.depthCm].some(x => x != null) ? `${p.widthCm ?? "—"} × ${p.heightCm ?? "—"} × ${p.depthCm ?? "—"} سم` : unavailable },
    { label: "السعة", value: p => specValue(p, "السعة") !== unavailable ? specValue(p, "السعة") : specValue(p, "capacity") },
    { label: "القدرة", value: p => specValue(p, "القدرة") !== unavailable ? specValue(p, "القدرة") : specValue(p, "power") },
    { label: "الاستخدام / المساحة المناسبة", value: p => specValue(p, "الاستخدام") !== unavailable ? specValue(p, "الاستخدام") : specValue(p, "recommended_area") },
  ];
  return <div>
    <div className="card p-5 mb-6">
      <label className="block font-bold text-navy mb-2" htmlFor="compare-search">ابحث واختر حتى 3 منتجات</label>
      <div className="relative"><Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/><input id="compare-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="اسم الجهاز أو الماركة أو القسم" className="w-full border rounded-xl py-3 pr-10 pl-4" /></div>
      <p className="text-sm text-slate-500 mt-3">تم اختيار {chosen.length} من 3. يمكنك مقارنة المنتجات الموجودة في قاعدة البيانات فقط.</p>
      {error && <p role="status" className="mt-3 rounded-lg bg-amber-50 text-amber-900 p-3 text-sm">{error}</p>}
      {loading ? <p className="py-8 text-center text-slate-500">جارٍ تحميل المنتجات...</p> : !filtered.length ? <div className="py-8 text-center text-slate-500"><Package className="mx-auto mb-2"/><p>{products.length ? "لا توجد منتجات مطابقة للبحث." : "لا توجد منتجات في الكتالوج حتى الآن. بعد إعداد قاعدة البيانات وإضافة المنتجات ستظهر هنا."}</p></div> : <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">{filtered.map(p => <label key={p.id} className={`flex items-start gap-3 border rounded-xl p-3 cursor-pointer ${chosen.includes(p.id) ? "border-amber-500 bg-amber-50" : "border-slate-200"}`}><input type="checkbox" checked={chosen.includes(p.id)} disabled={!chosen.includes(p.id) && chosen.length >= 3} onChange={()=>toggle(p.id)} className="mt-1 accent-amber-500"/><span className="min-w-0"><span className="block font-bold text-navy">{p.name}</span><span className="block text-xs text-slate-500 mt-1">{[p.brand,p.category].filter(Boolean).join(" · ") || "منتج"}</span><span className="block text-sm mt-2">{p.offers.length ? money(Math.min(...p.offers.map(o=>o.price))) : "السعر عبر المبيعات"}</span></span></label>)}</div>}
    </div>
    {selected.length > 0 && <div className="flex flex-wrap items-center justify-between gap-3 mb-4"><h2 className="text-2xl font-black text-navy flex items-center gap-2"><ArrowLeftRight/> نتيجة المقارنة</h2><button onClick={()=>setChosen([])} className="text-sm font-bold underline">مسح الاختيارات</button></div>}
    {selected.length < 2 ? <div className="card p-6 text-center text-slate-600">اختر منتجين على الأقل لعرض المقارنة.</div> : <div className="card overflow-auto"><table className="w-full min-w-[700px] text-right"><thead className="bg-navy text-white"><tr><th className="p-4 sticky right-0 bg-navy">معيار المقارنة</th>{selected.map(p=><th className="p-4 min-w-48" key={p.id}><div className="flex items-center gap-3"><div className="h-12 w-12 rounded-lg bg-white/10 overflow-hidden shrink-0">{p.image ? <img src={p.image} alt="" className="h-full w-full object-contain"/> : <Package className="m-3"/>}</div><span>{p.name}</span></div></th>)}</tr></thead><tbody>{rows.map(row=><tr key={row.label} className="border-b last:border-0"><th className="p-4 font-bold bg-slate-50 sticky right-0">{row.label}</th>{selected.map(p=><td className={`p-4 align-top ${row.winner?.(p) ? "bg-emerald-50 font-bold text-emerald-900" : ""}`} key={p.id}>{row.value(p)}{row.winner?.(p) && <span className="block text-xs mt-1">أقل سعر معلن</span>}</td>)}</tr>)}<tr className="border-t"><th className="p-4 bg-slate-50 sticky right-0">التفاصيل</th>{selected.map(p=><td className="p-4" key={p.id}><p className="text-sm text-slate-600 mb-3">{p.description || unavailable}</p>{p.brandWebsite && <a className="block text-sm text-blue-700 underline mb-3" href={p.brandWebsite} target="_blank" rel="noreferrer">موقع العلامة الرسمي</a>}<Link href="/products" className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-3 py-2 text-sm font-bold text-navy"><PhoneCall size={15}/> تواصل مع المبيعات</Link></td>)}</tr></tbody></table></div>}
    <p className="text-xs text-slate-500 mt-4">تنبيه: تمييز أقل سعر يعتمد على العروض المتاحة المسجلة فقط، ولا يعني تقييمًا عامًا لجودة المنتج. لا تُقدَّر المواصفات المفقودة ولا تُعتبر الأسعار نهائية قبل تأكيدها مع موظف المبيعات.</p>
  </div>;
}
