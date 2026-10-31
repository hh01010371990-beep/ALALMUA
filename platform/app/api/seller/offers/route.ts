import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const offerSchema = z.object({
  product_id: z.string().uuid(),
  price: z.number().finite().min(0).max(100000000),
  compare_at_price: z.number().finite().min(0).max(100000000).nullable().optional(),
  stock_quantity: z.number().int().min(0).max(1000000),
  warranty_months: z.number().int().min(0).max(240).nullable().optional(),
  delivery_days: z.number().int().min(0).max(365).nullable().optional(),
  delivery_fee: z.number().finite().min(0).max(1000000).nullable().optional(),
  is_available: z.boolean().default(true)
});

export async function POST(request: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: "Supabase غير مهيأ." }, { status: 503 });
  }
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "بيانات العرض غير صالحة." }, { status: 400 }); }
  const parsed = offerSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "راجع السعر والمخزون وباقي بيانات العرض." }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "سجّل الدخول أولًا." }, { status: 401 });
  const { data: seller, error: sellerError } = await supabase.from("sellers").select("id,status")
    .eq("owner_id", user.id).eq("seller_type", "MARKETPLACE_SELLER").maybeSingle();
  if (sellerError) return NextResponse.json({ error: "تعذر التحقق من حساب التاجر." }, { status: 500 });
  if (!seller) return NextResponse.json({ error: "لا يوجد حساب تاجر مرتبط بهذا المستخدم." }, { status: 404 });
  if (seller.status !== "APPROVED") return NextResponse.json({ error: "لا يمكنك نشر عروض قبل اعتماد حساب التاجر." }, { status: 403 });

  const payload = {
    product_id: parsed.data.product_id, seller_id: seller.id, price: parsed.data.price,
    compare_at_price: parsed.data.compare_at_price ?? null,
    stock_quantity: parsed.data.stock_quantity,
    warranty_months: parsed.data.warranty_months ?? null,
    delivery_days: parsed.data.delivery_days ?? null,
    delivery_fee: parsed.data.delivery_fee ?? null,
    is_available: parsed.data.is_available,
    currency_code: "EGP", price_source: "merchant_portal",
    // Merchant submission/update time is not an independent price verification.
    updated_at: new Date().toISOString()
  };
  const { data, error } = await supabase.from("seller_offers")
    .upsert(payload, { onConflict: "product_id,seller_id" })
    .select("id,product_id,price,stock_quantity,is_available,updated_at").single();
  if (error) return NextResponse.json({ error: "تعذر حفظ العرض. تحقق من تحديث قاعدة البيانات وسياسات RLS." }, { status: 500 });
  return NextResponse.json({ offer: data }, { status: 201 });
}
