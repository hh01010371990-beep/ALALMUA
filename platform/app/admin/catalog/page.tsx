import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isAdminRole } from "@/lib/auth/permissions";
import CatalogAdmin from "./manager";
export default async function CatalogAdminPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return <main className="container-wide py-10"><Link href="/admin" className="font-bold text-navy">← لوحة الإدارة</Link><h1 className="text-4xl font-black text-navy mt-6">إدارة المنتجات والعلامات التجارية</h1><p className="card p-5 mt-5">قاعدة البيانات غير مهيأة. أضف مفاتيح Supabase وطبّق migrations من 001 إلى 004.</p></main>;
  const sb = await createClient(); const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login?next=/admin/catalog");
  const { data: profile } = await sb.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!isAdminRole(profile?.role)) redirect("/");
  return <main className="container-wide py-10"><Link href="/admin" className="font-bold text-navy">← لوحة الإدارة</Link><p className="text-amber-700 font-bold mt-6">CATALOG CONTROL</p><h1 className="text-4xl font-black text-navy mt-2">إدارة المنتجات والعلامات التجارية</h1><p className="text-slate-600 mt-3 leading-7">إضافة وتعديل وحذف المنتجات، إدارة الصور والمواصفات، وربط العلامات بمواقعها الرسمية. المنتجات غير المنشورة لا تظهر للزوار.</p><CatalogAdmin /></main>;
}
