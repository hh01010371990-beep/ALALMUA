import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ products: [], configured: false, message: "الكتالوج المباشر يحتاج إعداد قاعدة البيانات أولًا." });
  }
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select(`id,name,slug,description,width_cm,height_cm,depth_cm,electricity_consumption,warranty_months,brands(name,website),categories(name),product_media(url,alt_text),product_specifications(specification_key,specification_value),seller_offers(id,price,stock_quantity,warranty_months,delivery_days,delivery_fee,is_available,last_price_verified_at,updated_at,price_source,sellers(id,business_name,status))`).order("name");
  if (error) return NextResponse.json({ products: [], configured: true, message: "تعذر تحميل المنتجات. تحقق من إعداد قاعدة البيانات." }, { status: 500 });
  const products = (data ?? []).map((p: any) => ({
    id: p.id, name: p.name, slug: p.slug, description: p.description,
    widthCm: p.width_cm == null ? null : Number(p.width_cm), heightCm: p.height_cm == null ? null : Number(p.height_cm), depthCm: p.depth_cm == null ? null : Number(p.depth_cm), electricityConsumption: p.electricity_consumption == null ? null : Number(p.electricity_consumption), warrantyMonths: p.warranty_months ?? null,
    specifications: (p.product_specifications ?? []).map((s: any) => ({ key: s.specification_key, value: s.specification_value })),
    brand: Array.isArray(p.brands) ? p.brands[0]?.name : p.brands?.name, brandWebsite: Array.isArray(p.brands) ? p.brands[0]?.website : p.brands?.website,
    category: Array.isArray(p.categories) ? p.categories[0]?.name : p.categories?.name,
    image: p.product_media?.[0]?.url ?? null,
    offers: (p.seller_offers ?? []).filter((o: any) => o.is_available && o.stock_quantity > 0 && o.sellers?.status === "APPROVED").map((o: any) => ({ id: o.id, price: Number(o.price), stock: o.stock_quantity, warrantyMonths: o.warranty_months, deliveryDays: o.delivery_days, deliveryFee: Number(o.delivery_fee ?? 0), priceUpdatedAt: o.updated_at ?? null, priceVerifiedAt: o.last_price_verified_at ?? null, sellerName: o.sellers?.business_name ?? "متجر معتمد" }))
  }));
  return NextResponse.json({ products, configured: true });
}
