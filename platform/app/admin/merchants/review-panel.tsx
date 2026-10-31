"use client";

import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, CircleAlert, LoaderCircle, RefreshCw, ShieldCheck, Store } from "lucide-react";

type Merchant = {
  id: string; business_name: string; seller_type: string; status: string;
  phone: string | null; business_category: string | null; address: string | null;
  description: string | null; submitted_at: string | null; created_at: string;
  review_note: string | null;
};
const statusLabels: Record<string, string> = {
  PENDING: "قيد الانتظار", UNDER_REVIEW: "قيد المراجعة", APPROVED: "معتمد",
  REJECTED: "مرفوض", SUSPENDED: "موقوف", ARCHIVED: "مؤرشف"
};

export default function MerchantReviewPanel() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [filter, setFilter] = useState("ALL");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/merchants", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "تعذر تحميل بيانات التجار.");
      setMerchants(body.merchants ?? []);
      setNotes(Object.fromEntries((body.merchants ?? []).map((m: Merchant) => [m.id, m.review_note ?? ""])));
    } catch (e) { setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function review(id: string, status: string) {
    setBusy(id); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/admin/merchants/${id}/review`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, review_note: notes[id] ?? "" })
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "تعذر حفظ القرار.");
      setMerchants(current => current.map(m => m.id === id ? { ...m, status: body.merchant.status, review_note: body.merchant.review_note } : m));
      setNotice(`تم تحديث حالة ${body.merchant.business_name} إلى: ${statusLabels[status] ?? status}.`);
    } catch (e) { setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع."); }
    finally { setBusy(null); }
  }

  const filtered = filter === "ALL" ? merchants : merchants.filter(m => m.status === filter);
  const pendingCount = merchants.filter(m => ["PENDING", "UNDER_REVIEW"].includes(m.status)).length;

  return <section className="mt-10" aria-labelledby="merchant-review-title">
    <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
      <div><p className="text-gold font-bold">Marketplace Operations</p><h2 id="merchant-review-title" className="text-2xl font-black text-navy mt-1">مراجعة طلبات التجار</h2><p className="text-slate-600 mt-2">اعتماد الحسابات وإضافة ملاحظات داخلية على الطلب.</p></div>
      <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 font-bold text-navy disabled:opacity-50"><RefreshCw size={17} className={loading ? "animate-spin" : ""}/> تحديث القائمة</button>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
      <div className="card p-4"><p className="text-slate-500 text-sm">إجمالي الحسابات</p><p className="text-2xl font-black text-navy mt-1">{merchants.length}</p></div>
      <div className="card p-4"><p className="text-slate-500 text-sm">بانتظار القرار</p><p className="text-2xl font-black text-navy mt-1">{pendingCount}</p></div>
      <div className="card p-4"><p className="text-slate-500 text-sm">حسابات معتمدة</p><p className="text-2xl font-black text-navy mt-1">{merchants.filter(m => m.status === "APPROVED").length}</p></div>
    </div>
    <div className="flex flex-wrap gap-2 mb-5" aria-label="تصفية التجار">
      {[{v:"ALL",l:"الكل"},{v:"PENDING",l:"قيد الانتظار"},{v:"UNDER_REVIEW",l:"قيد المراجعة"},{v:"APPROVED",l:"معتمد"},{v:"REJECTED",l:"مرفوض"},{v:"SUSPENDED",l:"موقوف"}].map(x => <button key={x.v} onClick={() => setFilter(x.v)} className={`rounded-full px-4 py-2 text-sm font-bold border ${filter === x.v ? "bg-navy text-white border-navy" : "bg-white text-slate-700"}`}>{x.l}</button>)}
    </div>
    {notice && <div role="status" className="mb-4 rounded-xl bg-emerald-50 text-emerald-800 p-4 flex gap-2"><BadgeCheck size={20}/>{notice}</div>}
    {error && <div role="alert" className="mb-4 rounded-xl bg-red-50 text-red-800 p-4 flex gap-2"><CircleAlert size={20}/>{error}</div>}
    {loading ? <div className="card p-8 flex items-center justify-center gap-3 text-slate-600"><LoaderCircle className="animate-spin"/> جارٍ تحميل الطلبات...</div> : filtered.length === 0 ? <div className="card p-8 text-center"><Store className="mx-auto text-slate-400" size={34}/><p className="font-bold text-navy mt-3">لا توجد طلبات في هذا التصنيف</p><p className="text-slate-500 text-sm mt-1">عند وصول طلب جديد سيظهر هنا.</p></div> : <div className="grid lg:grid-cols-2 gap-5">
      {filtered.map(m => <article className="card p-5 md:p-6" key={m.id}>
        <div className="flex items-start justify-between gap-3"><div><h3 className="text-xl font-black text-navy">{m.business_name}</h3><p className="text-slate-500 text-sm mt-1">{m.business_category || "نشاط غير محدد"}</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold whitespace-nowrap">{statusLabels[m.status] ?? m.status}</span></div>
        <div className="mt-4 space-y-2 text-sm text-slate-700"><p><strong>الهاتف:</strong> {m.phone || "غير مسجل"}</p><p><strong>العنوان:</strong> {m.address || "غير مسجل"}</p><p><strong>تاريخ التقديم:</strong> {new Date(m.submitted_at || m.created_at).toLocaleString("ar-EG")}</p><p className="leading-7"><strong>وصف النشاط:</strong> {m.description || "لا يوجد وصف"}</p></div>
        <label htmlFor={`note-${m.id}`} className="block text-sm font-bold text-navy mt-5 mb-2">ملاحظة المراجعة</label>
        <textarea id={`note-${m.id}`} value={notes[m.id] ?? ""} onChange={e => setNotes(n => ({ ...n, [m.id]: e.target.value }))} maxLength={1000} rows={2} placeholder="سبب الرفض أو مستندات مطلوبة أو ملاحظة داخلية..." className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-amber-500" />
        <div className="flex flex-wrap gap-2 mt-4">
          <button disabled={busy === m.id} onClick={() => void review(m.id, "APPROVED")} className="rounded-lg bg-emerald-700 text-white px-3 py-2 text-sm font-bold disabled:opacity-50"><ShieldCheck size={16} className="inline ml-1"/> اعتماد</button>
          <button disabled={busy === m.id} onClick={() => void review(m.id, "UNDER_REVIEW")} className="rounded-lg border px-3 py-2 text-sm font-bold text-navy disabled:opacity-50">قيد المراجعة</button>
          <button disabled={busy === m.id} onClick={() => void review(m.id, "REJECTED")} className="rounded-lg border border-red-200 text-red-700 px-3 py-2 text-sm font-bold disabled:opacity-50">رفض الطلب</button>
          {m.status === "APPROVED" && <button disabled={busy === m.id} onClick={() => void review(m.id, "SUSPENDED")} className="rounded-lg border border-amber-200 text-amber-800 px-3 py-2 text-sm font-bold disabled:opacity-50">إيقاف الحساب</button>}
          {busy === m.id && <span className="inline-flex items-center gap-2 text-sm text-slate-500"><LoaderCircle size={16} className="animate-spin"/> جارٍ الحفظ</span>}
        </div>
      </article>)}
    </div>}
  </section>;
}
