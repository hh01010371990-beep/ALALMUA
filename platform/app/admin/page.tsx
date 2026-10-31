import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isAdminRole } from "@/lib/auth/permissions";
import MerchantReviewPanel from "./merchants/review-panel";

const modules = [
  ["المنتجات", "إدارة Product Master والمواصفات والصور."],
  ["العلامات التجارية", "الشركات والتوكيلات والفئات وروابطها المعتمدة."],
  ["البائعون", "المتاجر والعروض وحالات الاعتماد."],
  ["القوة العاملة بالذكاء الاصطناعي", "إدارة الوكلاء ومجالات المعرفة والصلاحيات."],
  ["المنزل الافتراضي", "الغرف والعناصر والنماذج ثلاثية الأبعاد."],
  ["الإعدادات والأمان", "الأدوار والصلاحيات وسجل التدقيق."]
];

export default async function AdminPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return <main className="container-wide py-10"><p className="text-gold font-bold">Command Center</p><h1 className="text-4xl font-black text-navy">لوحة تحكم منصة الحازم</h1><div className="card p-6 mt-6"><h2 className="font-black text-xl text-navy">قاعدة البيانات غير مهيأة</h2><p className="text-slate-600 leading-7 mt-2">أضف مفاتيح Supabase إلى ملف .env.local ثم طبّق ملفات migrations لتفعيل لوحة الإدارة.</p></div></main>;
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!isAdminRole(profile?.role)) redirect("/");

  return <main className="container-wide py-10">
    <p className="text-gold font-bold">Command Center</p>
    <h1 className="text-4xl font-black text-navy">لوحة تحكم منصة الحازم</h1>
    <p className="text-slate-600 mt-3 leading-7">إدارة مركزية للأقسام وطلبات متابعة المبيعات، مع صلاحيات معتمدة على دور المستخدم. كما تُجهّز قاعدة البيانات عشرة موظفين افتراضيين متخصصين بالذكاء الاصطناعي.</p>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
      {modules.map(([title, desc]) => <div className="card p-6" key={title}><h2 className="font-black text-xl text-navy">{title}</h2><p className="text-slate-600 mt-2 leading-7">{desc}</p></div>)}
    </div>
    <div className="mt-8 flex flex-wrap gap-3"><Link href="/admin/catalog" className="inline-flex rounded-xl bg-navy text-white px-5 py-3 font-bold">إدارة المنتجات والعلامات التجارية</Link><Link href="/admin/sales-leads" className="inline-flex rounded-xl bg-navy text-white px-5 py-3 font-bold">فتح قائمة عملاء المبيعات</Link><Link href="/admin/ai-workforce" className="inline-flex rounded-xl bg-amber-400 text-navy px-5 py-3 font-bold">إدارة الموظفين الافتراضيين</Link></div>
    <MerchantReviewPanel />
  </main>;
}
