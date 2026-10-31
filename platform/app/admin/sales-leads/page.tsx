import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isAdminRole } from "@/lib/auth/permissions";
import LeadList from "./lead-list";
export default async function SalesLeadsPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return <main className="container-wide py-10"><h1 className="text-3xl font-black text-navy">طلبات التواصل مع المبيعات</h1><p className="card p-5 mt-5">قاعدة البيانات غير مهيأة. أضف إعدادات Supabase وطبّق ملفات migrations.</p></main>;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login?next=/admin/sales-leads");
  const { data: profile } = await sb.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!isAdminRole(profile?.role) && profile?.role !== "SALES_AGENT" && profile?.role !== "SALES_MANAGER") redirect("/");
  const { data: leads, error } = await sb.from("sales_leads").select("id,product_name,customer_name,phone,notes,status,created_at").order("created_at", { ascending: false }).limit(200);
  return <main className="container-wide py-10"><Link href="/admin" className="font-bold text-navy">← لوحة الإدارة</Link><h1 className="text-4xl font-black text-navy mt-5">طلبات التواصل مع المبيعات</h1><p className="text-slate-600 mt-2">هذه طلبات اهتمام فقط؛ لا تمثل عمليات شراء أو دفع. حدّث حالة المتابعة بعد التواصل مع العميل.</p>{error && <p className="mt-5 rounded-xl bg-amber-50 p-4">تعذر تحميل البيانات. تأكد من تطبيق migration 003.</p>}<LeadList initialLeads={leads ?? []}/></main>;
}
