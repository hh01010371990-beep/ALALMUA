import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const applicationSchema = z.object({
  business_name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(30),
  business_category: z.string().trim().min(2).max(100),
  address: z.string().trim().min(2).max(240),
  description: z.string().trim().min(10).max(1500),
  accept_terms: z.literal("yes"),
});

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "بيانات الطلب غير صالحة." }, { status: 400 }); }

  const parsed = applicationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "راجع البيانات المطلوبة وحاول مرة أخرى." }, { status: 400 });

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: "قاعدة البيانات غير مهيأة بعد. يلزم إعداد Supabase وتطبيق migration الخاصة ببوابة التجار." }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "سجّل الدخول أولًا قبل تقديم طلب التاجر." }, { status: 401 });

  const { data: existing, error: existingError } = await supabase.from("sellers").select("id,status").eq("owner_id", user.id).maybeSingle();
  if (existingError) return NextResponse.json({ error: "تعذر التحقق من طلبات التاجر. تأكد من تطبيق تحديث قاعدة البيانات." }, { status: 500 });
  if (existing) return NextResponse.json({ error: "يوجد بالفعل حساب تاجر مرتبط بهذا المستخدم. تواصل مع الإدارة لمتابعة حالته." }, { status: 409 });

  const { error } = await supabase.from("sellers").insert({
    owner_id: user.id,
    business_name: parsed.data.business_name,
    seller_type: "MARKETPLACE_SELLER",
    status: "PENDING",
    phone: parsed.data.phone,
    business_category: parsed.data.business_category,
    address: parsed.data.address,
    description: parsed.data.description,
    submitted_at: new Date().toISOString(),
  });
  if (error) return NextResponse.json({ error: "لم نتمكن من حفظ الطلب. تأكد من تطبيق migration وصلاحيات قاعدة البيانات." }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 201 });
}
