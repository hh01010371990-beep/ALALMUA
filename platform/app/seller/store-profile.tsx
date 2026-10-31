"use client";

import { FormEvent, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, LoaderCircle, Store } from "lucide-react";

type StoreData = { name: string; description: string | null; phone: string | null; whatsapp: string | null; city: string | null; address: string | null; logo_url: string | null; delivery_policy: string | null; return_policy: string | null; is_active: boolean };
const emptyStore: StoreData = { name: "", description: "", phone: "", whatsapp: "", city: "", address: "", logo_url: "", delivery_policy: "", return_policy: "", is_active: false };

export default function StoreProfile() {
  const [form, setForm] = useState<StoreData>(emptyStore);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  useEffect(() => {
    let active = true;
    fetch("/api/seller/store", { cache: "no-store" }).then(async response => {
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "تعذر تحميل ملف المتجر.");
      if (active && body.store) setForm({ ...emptyStore, ...body.store });
    }).catch(e => { if (active) setError(e instanceof Error ? e.message : "تعذر تحميل ملف المتجر."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  function update<K extends keyof StoreData>(key: K, value: StoreData[K]) { setForm(current => ({ ...current, [key]: value })); }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true); setError(""); setSuccess("");
    try {
      const response = await fetch("/api/seller/store", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "تعذر حفظ ملف المتجر.");
      setForm({ ...emptyStore, ...body.store }); setSuccess(body.message || "تم حفظ بيانات المتجر.");
    } catch (e) { setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع."); }
    finally { setSaving(false); }
  }
  if (loading) return <div className="card p-6 flex items-center gap-3 text-slate-600"><LoaderCircle className="animate-spin"/> جارٍ تحميل ملف المتجر...</div>;
  return <section className="card p-6 md:p-8">
    <div className="flex items-center gap-3 mb-6"><Store className="text-gold" size={28}/><div><h3 className="text-xl font-black text-navy">ملف المتجر وبيانات التواصل</h3><p className="text-sm text-slate-500 mt-1">حدّث معلومات المتجر وسياسات التوصيل والاسترجاع.</p></div></div>
    {error && <div role="alert" className="rounded-xl bg-red-50 text-red-800 p-4 mb-4 flex gap-2"><AlertCircle size={20}/>{error}</div>}
    {success && <div role="status" className="rounded-xl bg-emerald-50 text-emerald-800 p-4 mb-4 flex gap-2"><CheckCircle2 size={20}/>{success}</div>}
    <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
      <label><span className="block text-sm font-bold text-navy mb-2">اسم المتجر *</span><input required minLength={2} maxLength={120} value={form.name} onChange={e=>update("name",e.target.value)} className="w-full rounded-xl border p-3" placeholder="اسم متجرك"/></label>
      <label><span className="block text-sm font-bold text-navy mb-2">المدينة</span><input maxLength={100} value={form.city ?? ""} onChange={e=>update("city",e.target.value)} className="w-full rounded-xl border p-3" placeholder="مثال: الإسكندرية"/></label>
      <label><span className="block text-sm font-bold text-navy mb-2">رقم الهاتف</span><input maxLength={40} value={form.phone ?? ""} onChange={e=>update("phone",e.target.value)} className="w-full rounded-xl border p-3" placeholder="رقم التواصل"/></label>
      <label><span className="block text-sm font-bold text-navy mb-2">واتساب</span><input maxLength={40} value={form.whatsapp ?? ""} onChange={e=>update("whatsapp",e.target.value)} className="w-full rounded-xl border p-3" placeholder="رقم واتساب"/></label>
      <label className="md:col-span-2"><span className="block text-sm font-bold text-navy mb-2">العنوان</span><input maxLength={300} value={form.address ?? ""} onChange={e=>update("address",e.target.value)} className="w-full rounded-xl border p-3" placeholder="عنوان المتجر أو نطاق التوصيل"/></label>
      <label className="md:col-span-2"><span className="block text-sm font-bold text-navy mb-2">وصف المتجر</span><textarea maxLength={1500} rows={3} value={form.description ?? ""} onChange={e=>update("description",e.target.value)} className="w-full rounded-xl border p-3" placeholder="عرّف العملاء بمتجرك وتخصصك"/></label>
      <label className="md:col-span-2"><span className="block text-sm font-bold text-navy mb-2">رابط شعار المتجر (اختياري)</span><input type="url" value={form.logo_url ?? ""} onChange={e=>update("logo_url",e.target.value)} className="w-full rounded-xl border p-3" placeholder="https://..."/></label>
      <label><span className="block text-sm font-bold text-navy mb-2">سياسة التوصيل</span><textarea maxLength={1500} rows={3} value={form.delivery_policy ?? ""} onChange={e=>update("delivery_policy",e.target.value)} className="w-full rounded-xl border p-3" placeholder="المناطق والمدة والتكلفة"/></label>
      <label><span className="block text-sm font-bold text-navy mb-2">سياسة الاستبدال والاسترجاع</span><textarea maxLength={1500} rows={3} value={form.return_policy ?? ""} onChange={e=>update("return_policy",e.target.value)} className="w-full rounded-xl border p-3" placeholder="الشروط والمدة"/></label>
      <div className="md:col-span-2 flex flex-wrap items-center gap-3"><button disabled={saving || !form.name.trim()} className="rounded-xl bg-navy text-white px-6 py-3 font-black disabled:opacity-50">{saving ? <><LoaderCircle size={18} className="inline ml-2 animate-spin"/> جارٍ الحفظ...</> : "حفظ ملف المتجر"}</button><span className="text-xs text-slate-500">{form.is_active ? "المتجر مفعّل بواسطة الإدارة" : "ظهور المتجر للعملاء يحتاج تفعيل الإدارة"}</span></div>
    </form>
  </section>;
}
