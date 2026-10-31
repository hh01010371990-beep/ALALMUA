import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isAdminRole } from "@/lib/auth/permissions";
import AIWorkforceManager from "./workforce-manager";
export default async function AIWorkforcePage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return <main className="container-wide py-10"><h1 className="text-3xl font-black text-navy">إدارة الموظفين الافتراضيين</h1><p className="card p-5 mt-5">قاعدة البيانات غير مهيأة. أضف مفاتيح Supabase وطبّق migrations لتفعيل إدارة الموظفين.</p></main>;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login?next=/admin/ai-workforce");
  const { data: profile } = await sb.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!isAdminRole(profile?.role)) redirect("/");
  const { data: agents, error } = await sb.from("ai_agents").select("id,code,name,system_prompt,active").order("code");
  return <main className="container-wide py-10"><Link href="/admin" className="font-bold text-navy">← لوحة الإدارة</Link><p className="text-amber-700 font-bold mt-6">AI Workforce</p><h1 className="text-4xl font-black text-navy mt-2">إدارة الموظفين الافتراضيين</h1><p className="text-slate-600 leading-7 mt-3">عدّل اسم الموظف وتعليماته، أو أوقفه مؤقتًا. التعديلات تحتاج مراجعة واختبارًا قبل استخدامها في الإنتاج.</p>{error ? <p className="card p-5 mt-6">تعذر تحميل الموظفين. تأكد من تطبيق migration 003.</p> : <AIWorkforceManager initialAgents={agents ?? []}/>}</main>;
}
