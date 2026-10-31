import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isAdminRole } from "@/lib/auth/permissions";

const reviewSchema = z.object({
  status: z.enum(["UNDER_REVIEW", "APPROVED", "REJECTED", "SUSPENDED"]),
  review_note: z.string().trim().max(1000).optional().default("")
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: "Supabase غير مهيأ." }, { status: 503 });
  }
  const { id } = await context.params;
  const parsedId = z.string().uuid().safeParse(id);
  if (!parsedId.success) return NextResponse.json({ error: "معرّف التاجر غير صالح." }, { status: 400 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "بيانات المراجعة غير صالحة." }, { status: 400 }); }
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "حالة المراجعة غير صالحة." }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "يجب تسجيل الدخول." }, { status: 401 });
  const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profileError || !isAdminRole(profile?.role)) return NextResponse.json({ error: "ليس لديك صلاحية مراجعة التجار." }, { status: 403 });

  const { data, error } = await supabase.from("sellers").update({
    status: parsed.data.status,
    review_note: parsed.data.review_note || null,
    reviewed_at: new Date().toISOString()
  }).eq("id", id).select("id,business_name,status,review_note,reviewed_at").single();
  if (error) return NextResponse.json({ error: "تعذر حفظ قرار المراجعة. تحقق من migration وصلاحيات قاعدة البيانات." }, { status: 500 });
  return NextResponse.json({ merchant: data });
}
