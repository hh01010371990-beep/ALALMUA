"use client";
import { useState } from "react";

export default function MerchantApplicationForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{kind:"success"|"error", text:string}|null>(null);

  async function submit(formData: FormData) {
    setLoading(true); setMessage(null);
    const payload = Object.fromEntries(formData.entries());
    try {
      const response = await fetch("/api/merchant/apply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "تعذر إرسال الطلب.");
      setMessage({kind:"success", text:"تم إرسال طلب الانضمام للمراجعة بنجاح. سيظل المتجر غير ظاهر للجمهور حتى اعتماده."});
      (document.getElementById("merchant-application") as HTMLFormElement | null)?.reset();
    } catch (error) {
      setMessage({kind:"error", text:error instanceof Error ? error.message : "حدث خطأ غير متوقع."});
    } finally { setLoading(false); }
  }

  return <form id="merchant-application" action={submit} className="space-y-5">
    <div className="grid md:grid-cols-2 gap-5">
      <label className="block"><span className="font-bold text-sm">اسم النشاط التجاري *</span><input name="business_name" required minLength={2} maxLength={120} className="mt-2 w-full rounded-xl border border-slate-300 p-3" placeholder="اسم المتجر أو الشركة" /></label>
      <label className="block"><span className="font-bold text-sm">رقم الهاتف *</span><input name="phone" required inputMode="tel" maxLength={30} className="mt-2 w-full rounded-xl border border-slate-300 p-3" placeholder="رقم يمكن التواصل عليه" /></label>
      <label className="block"><span className="font-bold text-sm">نوع النشاط *</span><select name="business_category" required className="mt-2 w-full rounded-xl border border-slate-300 p-3"><option value="">اختر النشاط</option><option>أجهزة كهربائية</option><option>تكييفات</option><option>أدوات منزلية ومطبخ</option><option>نجف وإضاءة</option><option>ديكور وتحف</option><option>موزع أو وكيل</option><option>خدمات تركيب وصيانة</option><option>نشاط آخر</option></select></label>
      <label className="block"><span className="font-bold text-sm">المدينة / المحافظة *</span><input name="address" required maxLength={240} className="mt-2 w-full rounded-xl border border-slate-300 p-3" placeholder="مثال: الإسكندرية" /></label>
    </div>
    <label className="block"><span className="font-bold text-sm">وصف النشاط والمنتجات *</span><textarea name="description" required minLength={10} maxLength={1500} rows={4} className="mt-2 w-full rounded-xl border border-slate-300 p-3" placeholder="اكتب نبذة عن نشاطك والفئات التي تبيعها" /></label>
    <label className="flex items-start gap-3 text-sm leading-6 text-slate-600"><input type="checkbox" name="accept_terms" value="yes" required className="mt-1" /><span>أقر بأن البيانات المقدمة صحيحة، وأوافق على مراجعة الطلب قبل اعتماد المتجر وعرض المنتجات.</span></label>
    {message && <p role="status" className={`rounded-xl p-4 text-sm leading-6 ${message.kind === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>{message.text}</p>}
    <button disabled={loading} className="rounded-xl bg-navy text-white px-6 py-3 font-black disabled:opacity-60">{loading ? "جارٍ إرسال الطلب..." : "إرسال طلب الانضمام"}</button>
    <p className="text-xs text-slate-500 leading-6">لن يتم إرسال الطلب إذا لم تكن مسجل الدخول أو إذا لم تكن إعدادات Supabase مكتملة.</p>
  </form>;
}
