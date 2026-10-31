"use client";
import { useState } from "react";
import { PhoneCall, LoaderCircle, CheckCircle2 } from "lucide-react";

type Lead = { id: string; product_name: string; customer_name: string; phone: string; notes: string | null; status: string; created_at: string };
const statuses = [
  ["NEW", "جديد"], ["ASSIGNED", "تم التعيين"], ["CONTACTED", "تم التواصل"],
  ["QUALIFIED", "عميل مهتم"], ["CLOSED", "تمت المتابعة"], ["UNREACHABLE", "تعذر الوصول"],
] as const;
export default function LeadList({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  async function updateStatus(id: string, status: string) {
    setBusy(id); setNotice("");
    try {
      const response = await fetch(`/api/admin/sales-leads/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "تعذر تحديث الحالة.");
      setLeads(current => current.map(lead => lead.id === id ? { ...lead, status } : lead));
      setNotice("تم تحديث حالة المتابعة.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "حدث خطأ أثناء التحديث."); }
    finally { setBusy(null); }
  }
  return <>
    {notice && <p role="status" className="mt-4 rounded-xl bg-slate-100 p-3 text-sm text-navy">{notice}</p>}
    <div className="mt-7 space-y-3">{!leads.length ? <div className="card p-7 text-center text-slate-500">لا توجد طلبات تواصل مسجلة بعد.</div> : leads.map(lead => <article key={lead.id} className="card p-5">
      <div className="flex flex-wrap justify-between gap-4"><div className="min-w-0 flex-1"><h2 className="font-black text-lg text-navy">{lead.product_name}</h2><p className="mt-1">العميل: {lead.customer_name} · <a className="text-amber-700 font-bold" href={`tel:${lead.phone}`}>{lead.phone}</a></p><p className="text-xs text-slate-500 mt-2">{new Date(lead.created_at).toLocaleString("ar-EG")} · الحالة: {statuses.find(s => s[0] === lead.status)?.[1] ?? lead.status}</p>{lead.notes && <p className="text-sm mt-3">ملاحظات العميل: {lead.notes}</p>}</div><a href={`tel:${lead.phone}`} className="self-start rounded-xl bg-navy text-white px-4 py-2 font-bold inline-flex items-center gap-2"><PhoneCall size={16}/> اتصال بالعميل</a></div>
      <div className="mt-4 flex flex-wrap items-center gap-3"><label className="text-sm font-bold text-slate-700" htmlFor={`status-${lead.id}`}>تحديث المتابعة</label><select id={`status-${lead.id}`} value={lead.status} disabled={busy === lead.id} onChange={e => updateStatus(lead.id, e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm disabled:opacity-60">{statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>{busy === lead.id && <LoaderCircle className="animate-spin" size={17} />}{lead.status === "CLOSED" && <span className="inline-flex items-center gap-1 text-emerald-700 text-sm"><CheckCircle2 size={16}/> تمت المتابعة</span>}</div>
    </article>)}</div>
  </>;
}
