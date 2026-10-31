import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import OfferManager from "./offer-manager";
import StoreProfile from "./store-profile";

export default async function SellerDashboardPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return <main className="container-wide py-10"><h1 className="text-3xl font-black text-navy">لوحة التاجر</h1><div className="card p-6 mt-6"><p className="text-slate-600 leading-7">يلزم إعداد Supabase في ملف .env.local لتفعيل حساب التاجر وإدارة العروض.</p><Link href="/merchant" className="inline-block mt-4 text-navy font-bold">العودة إلى بوابة التجار</Link></div></main>;
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/seller");
  return <main className="container-wide py-10"><div className="mb-8"><p className="text-gold font-bold">Al Hazem Marketplace</p><h1 className="text-4xl font-black text-navy mt-2">لوحة التاجر</h1><p className="text-slate-600 mt-3 leading-7">إدارة عروض المنتجات والأسعار والمخزون من حسابك الخاص.</p></div><StoreProfile /><div className="mt-8"><OfferManager /></div></main>;
}
