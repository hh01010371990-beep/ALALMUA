import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isAdminRole } from "@/lib/auth/permissions";

const schema = z.object({
  status: z.enum(["NEW", "ASSIGNED", "CONTACTED", "QUALIFIED", "CLOSED", "UNREACHABLE"]),
});
const salesRoles = ["SALES_AGENT", "SALES_MANAGER"];

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: "Supabase غير مهيأ." }, { status: 503 });
  }
  const { id } = await context.params;
  if (!z.string().uuid().safeParse(id).success) return NextResponse.json({ error: "معرّف الطلب غير صالح." }, { status: 400 });
  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "البيانات غير صالحة." }, { status: 400 }); }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "حالة المتابعة غير صالحة." }, { status: 400 });

  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "سجّل الدخول أولًا." }, { status: 401 });
  const { data: profile } = await sb.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!isAdminRole(profile?.role) && !salesRoles.includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "ليس لديك صلاحية تحديث حالة متابعة المبيعات." }, { status: 403 });
  }
  const { data, error } = await sb.rpc("update_sales_lead_status", { p_lead_id: id, p_status: parsed.data.status });
  if (error) {
    const status = error.message.includes("Not authorized") ? 403 : error.message.includes("Lead not found") ? 404 : 500;
    return NextResponse.json({ error: status === 403 ? "ليس لديك صلاحية تحديث الحالة." : status === 404 ? "لم يتم العثور على طلب التواصل." : "تعذر تحديث الحالة. تأكد من تطبيق migration 003." }, { status });
  }
  return NextResponse.json({ ok: true, lead: { id: data.id, status: data.status } });
}
