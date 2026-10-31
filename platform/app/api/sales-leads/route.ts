import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getRequestClientKey } from "@/lib/security/rate-limit";
const schema = z.object({ product_id:z.string().uuid().nullable().optional(), product_name:z.string().trim().min(1).max(200), offer_id:z.string().uuid().nullable().optional(), customer_name:z.string().trim().min(2).max(120), phone:z.string().trim().min(6).max(40), notes:z.string().trim().max(1000).optional() });
export async function POST(request:Request){
 const clientKey = getRequestClientKey(request);
 const rate = checkRateLimit(`sales-lead:${clientKey}`, 5, 10 * 60_000);
 if (!rate.allowed) return NextResponse.json({error:"تم تجاوز عدد طلبات التواصل مؤقتًا. حاول بعد قليل."},{status:429,headers:{"Retry-After":String(Math.max(1,Math.ceil((rate.resetAt-Date.now())/1000)))}});
 if(!process.env.NEXT_PUBLIC_SUPABASE_URL||!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)return NextResponse.json({error:"قاعدة البيانات غير مهيأة؛ لم يتم تسجيل طلب التواصل. يرجى المحاولة لاحقًا."},{status:503});
 let body:unknown;try{body=await request.json()}catch{return NextResponse.json({error:"البيانات غير صالحة."},{status:400})}
 const parsed=schema.safeParse(body);if(!parsed.success)return NextResponse.json({error:"راجع الاسم ورقم الهاتف والمنتج."},{status:400});
 const supabase=await createClient();const {data,error}=await supabase.from("sales_leads").insert({product_id:parsed.data.product_id??null,product_name:parsed.data.product_name,offer_id:parsed.data.offer_id??null,customer_name:parsed.data.customer_name,phone:parsed.data.phone,notes:parsed.data.notes??null,source:"product_catalog",status:"NEW"}).select("id").single();
 if(error)return NextResponse.json({error:"تعذر تسجيل طلب التواصل. تأكد من تطبيق migration 003."},{status:500});
 return NextResponse.json({ok:true,lead_id:data.id},{status:201});
}
