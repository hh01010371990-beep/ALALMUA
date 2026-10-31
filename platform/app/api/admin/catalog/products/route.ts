import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isAdminRole } from "@/lib/auth/permissions";

async function admin() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "سجّل الدخول أولًا." }, { status: 401 }) };
  const { data: profile } = await sb.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!isAdminRole(profile?.role)) return { error: NextResponse.json({ error: "هذه الوظيفة متاحة للإدارة فقط." }, { status: 403 }) };
  return { sb };
}
const specSchema = z.array(z.object({ key: z.string().trim().min(1).max(100), value: z.string().trim().min(1).max(500) })).max(100).default([]);
const productSchema = z.object({
  id: z.string().uuid().optional(), name: z.string().trim().min(2).max(200), slug: z.string().trim().min(2).max(220).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  brand_id: z.string().uuid().nullable().optional(), category_id: z.string().uuid().nullable().optional(), description: z.string().trim().max(5000).nullable().optional(),
  model_number: z.string().trim().max(120).nullable().optional(), sku: z.string().trim().max(120).nullable().optional(),
  width_cm: z.number().nonnegative().nullable().optional(), height_cm: z.number().nonnegative().nullable().optional(), depth_cm: z.number().nonnegative().nullable().optional(),
  electricity_consumption: z.number().nonnegative().nullable().optional(), warranty_months: z.number().int().nonnegative().max(240).nullable().optional(),
  is_published: z.boolean().default(false), image_url: z.string().url().max(2000).nullable().optional(), image_alt: z.string().max(300).nullable().optional(), specifications: specSchema
});
export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return NextResponse.json({ error: "Supabase غير مهيأ." }, { status: 503 });
  const auth = await admin(); if ("error" in auth) return auth.error;
  const [{ data, error }, { data: categories }, { data: brands }] = await Promise.all([
    auth.sb.from("products").select("id,name,slug,brand_id,category_id,description,model_number,sku,width_cm,height_cm,depth_cm,electricity_consumption,warranty_months,is_published,updated_at,product_media(id,url,alt_text,is_primary),product_specifications(id,specification_key,specification_value)").order("updated_at", { ascending: false }),
    auth.sb.from("categories").select("id,name,slug").order("name"),
    auth.sb.from("brands").select("id,name").order("name")
  ]);
  if (error) return NextResponse.json({ error: "تعذر تحميل المنتجات. طبّق migration 004." }, { status: 500 });
  return NextResponse.json({ products: data ?? [], categories: categories ?? [], brands: brands ?? [] });
}
export async function POST(request: Request) { return save(request, false); }
export async function PATCH(request: Request) { return save(request, true); }
async function save(request: Request, editing: boolean) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return NextResponse.json({ error: "Supabase غير مهيأ." }, { status: 503 });
  const auth = await admin(); if ("error" in auth) return auth.error;
  let raw: unknown; try { raw = await request.json(); } catch { return NextResponse.json({ error: "البيانات غير صالحة." }, { status: 400 }); }
  const parsed = productSchema.safeParse(raw); if (!parsed.success) return NextResponse.json({ error: "راجع الحقول المطلوبة: الاسم، الرابط المختصر، والمواصفات." }, { status: 400 });
  if (editing && !parsed.data.id) return NextResponse.json({ error: "معرّف المنتج مطلوب للتعديل." }, { status: 400 });
  const { id, image_url, image_alt, specifications, ...fields } = parsed.data;
  const productFields = { ...fields, brand_id: fields.brand_id ?? null, category_id: fields.category_id ?? null, description: fields.description ?? null, model_number: fields.model_number ?? null, sku: fields.sku ?? null, width_cm: fields.width_cm ?? null, height_cm: fields.height_cm ?? null, depth_cm: fields.depth_cm ?? null, electricity_consumption: fields.electricity_consumption ?? null, warranty_months: fields.warranty_months ?? null };
  const productQuery = editing ? auth.sb.from("products").update(productFields).eq("id", id!).select("id").maybeSingle() : auth.sb.from("products").insert(productFields).select("id").single();
  const { data, error } = await productQuery;
  if (error || !data) return NextResponse.json({ error: error?.code === "23505" ? "اسم الرابط المختصر مستخدم بالفعل." : "تعذر حفظ المنتج. راجع صلاحيات قاعدة البيانات والحقول." }, { status: 500 });
  const { error: deleteSpecError } = await auth.sb.from("product_specifications").delete().eq("product_id", data.id);
  if (deleteSpecError) return NextResponse.json({ error: "تم حفظ المنتج لكن تعذر تحديث المواصفات. أعد المحاولة." }, { status: 500 });
  if (specifications.length) {
    const { error: specError } = await auth.sb.from("product_specifications").insert(specifications.map(s => ({ product_id: data.id, specification_key: s.key, specification_value: s.value })));
    if (specError) return NextResponse.json({ error: "تم حفظ المنتج لكن تعذر حفظ المواصفات." }, { status: 500 });
  }
  if (image_url) {
    const { data: existingMedia } = await auth.sb.from("product_media").select("id").eq("product_id", data.id);
    if (existingMedia?.length) {
      const { error: mediaError } = await auth.sb.from("product_media").update({ url: image_url, alt_text: image_alt ?? fields.name, is_primary: true, media_type: "image" }).eq("id", existingMedia[0].id);
      if (mediaError) return NextResponse.json({ error: "تم حفظ المنتج لكن تعذر تحديث الصورة." }, { status: 500 });
      if (existingMedia.length > 1) await auth.sb.from("product_media").delete().eq("product_id", data.id).neq("id", existingMedia[0].id);
    } else {
      const { error: mediaError } = await auth.sb.from("product_media").insert({ product_id: data.id, url: image_url, alt_text: image_alt ?? fields.name, is_primary: true, media_type: "image" });
      if (mediaError) return NextResponse.json({ error: "تم حفظ المنتج لكن تعذر حفظ الصورة." }, { status: 500 });
    }
  }
  return NextResponse.json({ ok: true, id: data.id }, { status: editing ? 200 : 201 });
}
export async function DELETE(request: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return NextResponse.json({ error: "Supabase غير مهيأ." }, { status: 503 });
  const auth = await admin(); if ("error" in auth) return auth.error;
  let id = ""; try { id = new URL(request.url).searchParams.get("id") ?? ""; } catch {}
  if (!z.string().uuid().safeParse(id).success) return NextResponse.json({ error: "معرّف المنتج غير صالح." }, { status: 400 });
  const { error } = await auth.sb.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "تعذر حذف المنتج. قد يكون مرتبطًا ببيانات أخرى." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
