import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isAdminRole } from "@/lib/auth/permissions";

async function adminClient() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "سجّل الدخول أولًا." }, { status: 401 }) };
  const { data: profile } = await sb.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!isAdminRole(profile?.role)) return { error: NextResponse.json({ error: "هذه الصفحة متاحة للإدارة فقط." }, { status: 403 }) };
  return { sb };
}

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return NextResponse.json({ error: "Supabase غير مهيأ." }, { status: 503 });
  const auth = await adminClient();
  if ("error" in auth) return auth.error;
  const { data, error } = await auth.sb.from("ai_agents").select("id,code,name,system_prompt,knowledge_scope,allowed_actions,handoff_rules,active").order("code");
  if (error) return NextResponse.json({ error: "تعذر تحميل الموظفين الافتراضيين. طبّق migration 003." }, { status: 500 });
  return NextResponse.json({ agents: data ?? [] });
}

const patchSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(2).max(100),
  system_prompt: z.string().trim().min(20).max(5000),
  active: z.boolean(),
});
export async function PATCH(request: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return NextResponse.json({ error: "Supabase غير مهيأ." }, { status: 503 });
  const auth = await adminClient();
  if ("error" in auth) return auth.error;
  let raw: unknown;
  try { raw = await request.json(); } catch { return NextResponse.json({ error: "البيانات غير صالحة." }, { status: 400 }); }
  const parsed = patchSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "راجع اسم الموظف وتعليماته وحالته." }, { status: 400 });
  const { id, ...changes } = parsed.data;
  const { data, error } = await auth.sb.from("ai_agents").update(changes).eq("id", id).select("id,code,name,system_prompt,active").maybeSingle();
  if (error) return NextResponse.json({ error: "تعذر حفظ التعديلات. تحقق من سياسات قاعدة البيانات." }, { status: 500 });
  if (!data) return NextResponse.json({ error: "الموظف الافتراضي غير موجود." }, { status: 404 });
  return NextResponse.json({ ok: true, agent: data });
}
