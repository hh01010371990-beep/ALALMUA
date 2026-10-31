import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isAdminRole } from "@/lib/auth/permissions";
async function admin() {
  const sb = await createClient(); const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "سجّل الدخول أولًا." }, { status: 401 }) };
  const { data: profile } = await sb.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!isAdminRole(profile?.role)) return { error: NextResponse.json({ error: "هذه الوظيفة متاحة للإدارة فقط." }, { status: 403 }) };
  return { sb };
}
const schema = z.object({ id: z.string().uuid().optional(), name: z.string().trim().min(2).max(120), description: z.string().trim().max(2000).nullable().optional(), website: z.string().url().max(1000).nullable().optional(), logo_url: z.string().url().max(1000).nullable().optional(), facebook_url: z.string().url().max(1000).nullable().optional(), instagram_url: z.string().url().max(1000).nullable().optional(), tiktok_url: z.string().url().max(1000).nullable().optional(), official_support_url: z.string().url().max(1000).nullable().optional() });
export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return NextResponse.json({ error: "Supabase غير مهيأ." }, { status: 503 });
  const a = await admin(); if ("error" in a) return a.error;
  const { data, error } = await a.sb.from("brands").select("id,name,description,website,logo_url,facebook_url,instagram_url,tiktok_url,official_support_url,updated_at").order("name");
  if (error) return NextResponse.json({ error: "تعذر تحميل العلامات التجارية. طبّق migration 004." }, { status: 500 });
  return NextResponse.json({ brands: data ?? [] });
}
export async function POST(req: Request) { return save(req, false); }
export async function PATCH(req: Request) { return save(req, true); }
async function save(req: Request, editing: boolean) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return NextResponse.json({ error: "Supabase غير مهيأ." }, { status: 503 });
  const a = await admin(); if ("error" in a) return a.error;
  let raw: unknown; try { raw = await req.json(); } catch { return NextResponse.json({ error: "البيانات غير صالحة." }, { status: 400 }); }
  const p = schema.safeParse(raw); if (!p.success) return NextResponse.json({ error: "راجع الاسم والروابط. استخدم رابطًا كاملًا يبدأ بـ https://." }, { status: 400 });
  if (editing && !p.data.id) return NextResponse.json({ error: "معرّف العلامة مطلوب للتعديل." }, { status: 400 });
  const { id, ...fields } = p.data;
  const normalized = Object.fromEntries(Object.entries(fields).map(([k,v]) => [k, v === "" ? null : v]));
  const result = editing ? await a.sb.from("brands").update(normalized).eq("id", id!).select("id").maybeSingle() : await a.sb.from("brands").insert(normalized).select("id").single();
  if (result.error || !result.data) return NextResponse.json({ error: result.error?.code === "23505" ? "هذه العلامة مسجلة بالفعل." : "تعذر حفظ العلامة التجارية." }, { status: 500 });
  return NextResponse.json({ ok: true, id: result.data.id }, { status: editing ? 200 : 201 });
}
export async function DELETE(req: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return NextResponse.json({ error: "Supabase غير مهيأ." }, { status: 503 });
  const a = await admin(); if ("error" in a) return a.error;
  const id = new URL(req.url).searchParams.get("id") ?? ""; if (!z.string().uuid().safeParse(id).success) return NextResponse.json({ error: "معرّف العلامة غير صالح." }, { status: 400 });
  const { error } = await a.sb.from("brands").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "تعذر الحذف. قد تكون العلامة مرتبطة بمنتجات؛ انقل المنتجات إلى علامة أخرى أولًا." }, { status: 409 });
  return NextResponse.json({ ok: true });
}
