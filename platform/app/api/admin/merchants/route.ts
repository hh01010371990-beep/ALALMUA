import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminRole } from "@/lib/auth/permissions";

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: "Supabase غير مهيأ." }, { status: 503 });
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "يجب تسجيل الدخول." }, { status: 401 });
  const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profileError || !isAdminRole(profile?.role)) return NextResponse.json({ error: "ليس لديك صلاحية إدارة التجار." }, { status: 403 });

  const { data, error } = await supabase.from("sellers")
    .select("id,business_name,seller_type,status,phone,business_category,address,description,submitted_at,created_at,review_note,owner_id")
    .order("created_at", { ascending: false }).limit(200);
  if (error) return NextResponse.json({ error: "تعذر تحميل طلبات التجار." }, { status: 500 });
  return NextResponse.json({ merchants: data ?? [] });
}
