"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, LoaderCircle, PackagePlus, RefreshCw, Store } from "lucide-react";

type Product = { id: string; name: string; slug: string };
type Offer = { id: string; product_id: string; price: number; compare_at_price: number | null; stock_quantity: number; warranty_months: number | null; delivery_days: number | null; delivery_fee: number | null; is_available: boolean; currency_code: string; updated_at: string; products?: { name?: string; slug?: string } | null };
type Seller = { id: string; business_name: string; status: string; phone: string | null; business_category: string | null; review_note: string | null };
const labels: Record<string,string> = { PENDING:"قيد الانتظار", UNDER_REVIEW:"قيد المراجعة", APPROVED:"معتمد", REJECTED:"مرفوض", SUSPENDED:"موقوف", ARCHIVED:"مؤرشف" };

export default function OfferManager() {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [productId, setProductId] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [stock, setStock] = useState("1");
  const [warranty, setWarranty] = useState("12");
  const [delivery, setDelivery] = useState("3");
  const [deliveryFee, setDeliveryFee] = useState("0");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/seller/overview", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "تعذر تحميل لوحة التاجر.");
      setSeller(body.seller); setProducts(body.products ?? []); setOffers(body.offers ?? []);
      if (!productId && body.products?.length) setProductId(body.products[0].id);
    } catch (e) { setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع."); }
    finally { setLoading(false); }
  }, [productId]);
  useEffect(() => { void load(); }, [load]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true); setError(""); setSuccess("");
    const numeric = (v: string) => v.trim() === "" ? null : Number(v);
    try {
      const response = await fetch("/api/seller/offers", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({
        product_id: productId, price: Number(price), compare_at_price: numeric(comparePrice), stock_quantity: Number(stock),
        warranty_months: numeric(warranty), delivery_days: numeric(delivery), delivery_fee: numeric(deliveryFee), is_available: Number(stock) > 0
      }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "تعذر حفظ العرض.");
      setSuccess("تم حفظ العرض وتسجيل وقت تحديث السعر."); setPrice(""); setComparePrice(""); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع."); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="card p-8 flex items-center justify-center gap-3 text-slate-600"><LoaderCircle className="animate-spin"/> جارٍ تحميل بيانات المتجر...</div>;
  if (!seller) return <div className="card p-7"><Store className="text-gold mb-4" size={34}/><h2 className="text-2xl font-black text-navy">لا يوجد حساب تاجر مرتبط بك</h2><p className="text-slate-600 leading-7 mt-2">قدّم طلب الانضمام أولًا، ثم ارجع إلى هذه الصفحة بعد تسجيل الدخول.</p><a href="/merchant/apply" className="inline-block rounded-xl bg-navy text-white px-5 py-3 font-bold mt-5">تقديم طلب التاجر</a></div>;
  if (seller.status !== "APPROVED") return <div className="card p-7"><Store className="text-gold mb-4" size={34}/><h2 className="text-2xl font-black text-navy">{seller.business_name}</h2><p className="mt-3 text-slate-600">حالة حسابك: <strong>{labels[seller.status] ?? seller.status}</strong></p><p className="text-slate-600 leading-7 mt-2">ستظهر أدوات إدارة العروض بعد اعتماد الحساب من إدارة الحازم.</p>{seller.review_note && <div className="bg-amber-50 text-amber-900 rounded-xl p-4 mt-4">ملاحظة الإدارة: {seller.review_note}</div>}<button onClick={() => void load()} className="mt-5 inline-flex items-center gap-2 rounded-xl border px-4 py-2 font-bold"><RefreshCw size={16}/> تحديث الحالة</button></div>;

  return <div className="space-y-8">
    <div className="card p-6 flex flex-wrap items-center justify-between gap-4"><div><p className="text-gold font-bold">Merchant Workspace</p><h2 className="text-2xl font-black text-navy mt-1">مرحبًا، {seller.business_name}</h2><p className="text-slate-600 mt-2">إدارة عروض متجرك وأسعار المنتجات ومخزونها.</p></div><span className="rounded-full bg-emerald-50 text-emerald-800 px-4 py-2 text-sm font-bold"><CheckCircle2 size={16} className="inline ml-1"/> حساب معتمد</span></div>
    <section className="card p-6 md:p-8"><div className="flex items-center gap-3 mb-6"><PackagePlus className="text-gold" size={28}/><div><h3 className="text-xl font-black text-navy">إضافة أو تحديث عرض</h3><p className="text-slate-500 text-sm mt-1">اختر منتجًا من كتالوج الحازم لتجنب تكرار بيانات المنتج.</p></div></div>
      {error && <div role="alert" className="rounded-xl bg-red-50 text-red-800 p-4 mb-4 flex gap-2"><AlertCircle size={20}/>{error}</div>}
      {success && <div role="status" className="rounded-xl bg-emerald-50 text-emerald-800 p-4 mb-4 flex gap-2"><CheckCircle2 size={20}/>{success}</div>}
      {products.length === 0 ? <p className="text-slate-600">لا توجد منتجات متاحة في الكتالوج بعد. أضف المنتجات من لوحة الإدارة أولًا.</p> : <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
        <label className="block md:col-span-2"><span className="block text-sm font-bold text-navy mb-2">المنتج</span><select required value={productId} onChange={e=>setProductId(e.target.value)} className="w-full rounded-xl border p-3 bg-white">{products.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select></label>
        <label><span className="block text-sm font-bold text-navy mb-2">سعر البيع (جنيه)</span><input required type="number" min="0" step="0.01" value={price} onChange={e=>setPrice(e.target.value)} className="w-full rounded-xl border p-3" placeholder="مثال: 12500"/></label>
        <label><span className="block text-sm font-bold text-navy mb-2">السعر قبل الخصم (اختياري)</span><input type="number" min="0" step="0.01" value={comparePrice} onChange={e=>setComparePrice(e.target.value)} className="w-full rounded-xl border p-3" placeholder="اتركه فارغًا إذا لا يوجد خصم"/></label>
        <label><span className="block text-sm font-bold text-navy mb-2">الكمية المتاحة</span><input required type="number" min="0" step="1" value={stock} onChange={e=>setStock(e.target.value)} className="w-full rounded-xl border p-3"/></label>
        <label><span className="block text-sm font-bold text-navy mb-2">الضمان (بالشهور)</span><input type="number" min="0" max="240" value={warranty} onChange={e=>setWarranty(e.target.value)} className="w-full rounded-xl border p-3"/></label>
        <label><span className="block text-sm font-bold text-navy mb-2">مدة التوصيل (بالأيام)</span><input type="number" min="0" max="365" value={delivery} onChange={e=>setDelivery(e.target.value)} className="w-full rounded-xl border p-3"/></label>
        <label><span className="block text-sm font-bold text-navy mb-2">رسوم التوصيل (جنيه)</span><input type="number" min="0" step="0.01" value={deliveryFee} onChange={e=>setDeliveryFee(e.target.value)} className="w-full rounded-xl border p-3"/></label>
        <div className="md:col-span-2"><button disabled={saving || !productId} className="rounded-xl bg-navy text-white px-6 py-3 font-black disabled:opacity-50">{saving ? <><LoaderCircle size={18} className="inline ml-2 animate-spin"/> جارٍ الحفظ...</> : "حفظ العرض"}</button></div>
      </form>}
    </section>
    <section><div className="flex items-center justify-between gap-3 mb-4"><h3 className="text-xl font-black text-navy">عروض متجري</h3><button onClick={() => void load()} className="inline-flex items-center gap-2 text-sm font-bold text-navy"><RefreshCw size={16}/> تحديث</button></div>
      {offers.length === 0 ? <div className="card p-6 text-slate-600">لم تضف عروضًا بعد.</div> : <div className="grid md:grid-cols-2 gap-4">{offers.map(o=><article key={o.id} className="card p-5"><div className="flex items-start justify-between gap-3"><h4 className="font-black text-navy">{o.products?.name || products.find(p=>p.id===o.product_id)?.name || "منتج"}</h4><span className={`rounded-full px-3 py-1 text-xs font-bold ${o.is_available && o.stock_quantity > 0 ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{o.is_available && o.stock_quantity > 0 ? "متاح" : "غير متاح"}</span></div><p className="text-2xl font-black text-navy mt-4">{Number(o.price).toLocaleString("ar-EG")} ج.م</p><div className="grid grid-cols-2 gap-2 text-sm text-slate-600 mt-3"><p>المخزون: {o.stock_quantity}</p><p>الضمان: {o.warranty_months ?? "—"} شهر</p><p>التوصيل: {o.delivery_days ?? "—"} يوم</p><p>رسوم التوصيل: {o.delivery_fee == null ? "غير محددة" : `${Number(o.delivery_fee).toLocaleString("ar-EG")} ج.م`}</p></div><p className="text-xs text-slate-500 mt-4">آخر تحديث: {new Date(o.updated_at).toLocaleString("ar-EG")}</p></article>)}</div>}
    </section>
  </div>;
}
