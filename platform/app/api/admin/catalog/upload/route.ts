import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { isAdminRole } from "@/lib/auth/permissions";
const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
export async function POST(req: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return NextResponse.json({ error: "Supabase غير مهيأ." }, { status: 503 });
  const sb = await createClient(); const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "سجّل الدخول أولًا." }, { status: 401 });
  const { data: profile } = await sb.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!isAdminRole(profile?.role)) return NextResponse.json({ error: "رفع الصور متاح للإدارة فقط." }, { status: 403 });
  let form: FormData; try { form = await req.formData(); } catch { return NextResponse.json({ error: "ملف غير صالح." }, { status: 400 }); }
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "اختر صورة أولًا." }, { status: 400 });
  if (!allowed.has(file.type)) return NextResponse.json({ error: "الصيغ المدعومة: JPG وPNG وWebP وAVIF." }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "أقصى حجم للصورة 5 ميجابايت." }, { status: 400 });
  const ext = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
  const path = `${user.id}/${randomUUID()}.${ext}`;
  const { error } = await sb.storage.from("alhazem-product-media").upload(path, file, { contentType: file.type, upsert: false });
  if (error) return NextResponse.json({ error: "تعذر رفع الصورة. طبّق migration 004 وتحقق من سياسات التخزين." }, { status: 500 });
  const { data } = sb.storage.from("alhazem-product-media").getPublicUrl(path);
  return NextResponse.json({ ok: true, url: data.publicUrl });
}
