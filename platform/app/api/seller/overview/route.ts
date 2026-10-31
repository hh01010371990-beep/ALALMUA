import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: "Supabase غير مهيأ." }, { status: 503 });
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "سجّل الدخول لفتح لوحة التاجر." }, { status: 401 });
  const { data: seller, error: sellerError } = await supabase.from("sellers")
    .select("id,business_name,status,phone,business_category,review_note")
    .eq("owner_id", user.id).eq("seller_type", "MARKETPLACE_SELLER").maybeSingle();
  if (sellerError) return NextResponse.json({ error: "تعذر تحميل بيانات التاجر." }, { status: 500 });
  if (!seller) return NextResponse.json({ seller: null, products: [], offers: [] });
  if (seller.status !== "APPROVED") return NextResponse.json({ seller, products: [], offers: [] });

  const [{ data: products, error: productsError }, { data: offers, error: offersError }] = await Promise.all([
    supabase.from("products").select("id,name,slug").order("name").limit(300),
    supabase.from("seller_offers").select("id,product_id,price,compare_at_price,stock_quantity,warranty_months,delivery_days,delivery_fee,is_available,currency_code,updated_at,products(name,slug)").eq("seller_id", seller.id).order("updated_at", { ascending: false })
  ]);
  if (productsError || offersError) return NextResponse.json({ error: "تعذر تحميل المنتجات والعروض. تحقق من تطبيق migrations وسياسات RLS." }, { status: 500 });
  return NextResponse.json({ seller, products: products ?? [], offers: offers ?? [] });
}
