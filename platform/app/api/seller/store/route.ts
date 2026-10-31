import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const storeSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1500).nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  whatsapp: z.string().trim().max(40).nullable().optional(),
  city: z.string().trim().max(100).nullable().optional(),
  address: z.string().trim().max(300).nullable().optional(),
  logo_url: z.string().trim().url().max(1000).nullable().optional().or(z.literal("")),
  delivery_policy: z.string().trim().max(1500).nullable().optional(),
  return_policy: z.string().trim().max(1500).nullable().optional()
});

async function getApprovedSeller() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, seller: null, response: NextResponse.json({ error: "سجّل الدخول أولًا." }, { status: 401 }) };
  const { data: seller, error } = await supabase.from("sellers").select("id,status")
    .eq("owner_id", user.id).eq("seller_type", "MARKETPLACE_SELLER").maybeSingle();
  if (error) return { supabase, user, seller: null, response: NextResponse.json({ error: "تعذر التحقق من حساب التاجر." }, { status: 500 }) };
  if (!seller) return { supabase, user, seller: null, response: NextResponse.json({ error: "لا يوجد حساب تاجر مرتبط بهذا المستخدم." }, { status: 404 }) };
  if (seller.status !== "APPROVED") return { supabase, user, seller, response: NextResponse.json({ error: "إدارة ملف المتجر متاحة بعد اعتماد حساب التاجر." }, { status: 403 }) };
  return { supabase, user, seller, response: null };
}

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return NextResponse.json({ error: "Supabase غير مهيأ." }, { status: 503 });
  const ctx = await getApprovedSeller();
  if (ctx.response) return ctx.response;
  const { data, error } = await ctx.supabase.from("stores").select("id,name,slug,description,phone,whatsapp,city,address,logo_url,delivery_policy,return_policy,is_active,updated_at").eq("seller_id", ctx.seller!.id).maybeSingle();
  if (error) return NextResponse.json({ error: "تعذر تحميل ملف المتجر. تأكد من تطبيق migration رقم 002." }, { status: 500 });
  return NextResponse.json({ store: data ?? null });
}

export async function PUT(request: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return NextResponse.json({ error: "Supabase غير مهيأ." }, { status: 503 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "بيانات المتجر غير صالحة." }, { status: 400 }); }
  const parsed = storeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "راجع اسم المتجر والرابط وباقي البيانات المدخلة." }, { status: 400 });
  const ctx = await getApprovedSeller();
  if (ctx.response) return ctx.response;
  const name = parsed.data.name;
  const slugBase = name.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 55) || "store";
  const slug = `${slugBase}-${ctx.seller!.id.slice(0, 8)}`;
  const payload = { ...parsed.data, description: parsed.data.description || null, phone: parsed.data.phone || null, whatsapp: parsed.data.whatsapp || null, city: parsed.data.city || null, address: parsed.data.address || null, logo_url: parsed.data.logo_url || null, delivery_policy: parsed.data.delivery_policy || null, return_policy: parsed.data.return_policy || null, seller_id: ctx.seller!.id, slug, updated_at: new Date().toISOString() };
  const { data, error } = await ctx.supabase.from("stores").upsert(payload, { onConflict: "seller_id" }).select("id,name,slug,description,phone,whatsapp,city,address,logo_url,delivery_policy,return_policy,is_active,updated_at").single();
  if (error) return NextResponse.json({ error: "تعذر حفظ ملف المتجر. تحقق من تطبيق migration رقم 002 وسياسات قاعدة البيانات." }, { status: 500 });
  return NextResponse.json({ store: data, message: "تم حفظ بيانات المتجر. تفعيل ظهوره للعملاء يظل من صلاحيات إدارة الحازم." });
}
