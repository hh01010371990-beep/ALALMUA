import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getRequestClientKey } from "@/lib/security/rate-limit";
const bodySchema=z.object({message:z.string().trim().min(1).max(4000),agent:z.enum(["sales","product","ac","home","comparison","support","content","analytics","virtual-home","quality"]).default("sales")});
const agents:Record<string,{name:string;prompt:string}>={
 sales:{name:"مستشار المبيعات",prompt:"أنت مستشار المبيعات الافتراضي لمنصة الحازم. افهم احتياج العميل، قدم إرشادًا صادقًا، وعندما يكون العميل مستعدًا للشراء وجّهه للتواصل مع موظف المبيعات. لا تنشئ طلب شراء أو تحصّل أموالًا."},
 product:{name:"خبير المنتجات",prompt:"أنت خبير المنتجات. اشرح المواصفات المتاحة فقط ولا تخترع أرقامًا أو ضمانًا غير موثق. عند نقص البيانات صرّح بذلك ووجّه العميل للمبيعات."},
 ac:{name:"مهندس التكييف",prompt:"أنت مساعد إرشادي للتكييف. اسأل عن المساحة والارتفاع والتعرض للشمس والاستخدام، وقدّم تقديرًا مبدئيًا لا يحل محل معاينة الفني."},
 home:{name:"مستشار تجهيز المنزل",prompt:"ساعد المستخدم في إعداد قائمة احتياجات المنزل حسب المساحة والميزانية والأولويات. لا تدّع أن الأسعار محدثة ما لم تكن البيانات متاحة."},
 comparison:{name:"محلل المقارنات",prompt:"قارن المنتجات بالبيانات المقدمة فقط، مثل السعر والأبعاد والضمان واستهلاك الكهرباء. وضح البيانات الناقصة."},
 support:{name:"خدمة العملاء",prompt:"أجب عن أسئلة استخدام المنصة بلطف. حول الشكاوى والحالات الحساسة إلى موظف بشري."},
 content:{name:"مدير المحتوى",prompt:"أنشئ مسودات عربية واضحة لمحتوى المنتجات والإرشادات دون اختلاق مواصفات، واذكر أن النشر يحتاج موافقة بشرية."},
 analytics:{name:"محلل البيانات",prompt:"ساعد في تحليل البيانات التي يقدمها المستخدم فقط، ولا تختلق أرقام أداء أو تتخذ قرارات تشغيلية."},
 "virtual-home":{name:"مصمم المنزل الافتراضي",prompt:"اقترح أفكار توزيع منتجات داخل المساحات بناءً على الأبعاد المتاحة، ووضح أن التصور لا يغني عن القياس والتحقق الفني."},
 quality:{name:"مراقب جودة الكتالوج",prompt:"ساعد في اكتشاف نقص البيانات وتعارض المواصفات والأسعار، ولا تعدّل بيانات المنتجات أو الأسعار بنفسك."}
};
export async function POST(request:Request){
 const clientKey = getRequestClientKey(request);
 const rate = checkRateLimit(`ai:${clientKey}`, 10, 60_000);
 if (!rate.allowed) return NextResponse.json({ok:false,error:"تم تجاوز عدد الطلبات المسموح به مؤقتًا. حاول بعد دقيقة."},{status:429,headers:{"Retry-After":String(Math.max(1,Math.ceil((rate.resetAt-Date.now())/1000)))}});
 let raw:unknown;try{raw=await request.json()}catch{return NextResponse.json({ok:false,error:"البيانات غير صالحة."},{status:400})}const parsed=bodySchema.safeParse(raw);if(!parsed.success)return NextResponse.json({ok:false,error:"أدخل سؤالك واختر الموظف الافتراضي."},{status:400});let agent=agents[parsed.data.agent];
 const agentCodes:Record<string,string>={sales:"AI-01",product:"AI-02",ac:"AI-03",home:"AI-04",comparison:"AI-05",support:"AI-06",content:"AI-07",analytics:"AI-08","virtual-home":"AI-09",quality:"AI-10"};
 if(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY){
   try { const sb=await createClient(); const {data:dbAgent}=await sb.from("ai_agents").select("name,system_prompt,active").eq("code",agentCodes[parsed.data.agent]).maybeSingle();
     if(!dbAgent || !dbAgent.active) return NextResponse.json({ok:false,error:"هذا الموظف الافتراضي غير متاح حاليًا."},{status:404});
     agent={name:dbAgent.name,prompt:dbAgent.system_prompt};
   } catch { /* Use the scoped built-in prompt if database configuration is incomplete. */ }
 }
 if(!process.env.OPENAI_API_KEY)return NextResponse.json({ok:true,mode:"demo",agent:agent.name,reply:`الموظف الافتراضي: ${agent.name}. تم استلام سؤالك. لتفعيل إجابة الذكاء الاصطناعي الفعلية، يلزم إعداد OPENAI_API_KEY. لا تنفذ المنصة شراءً أو دفعًا؛ يتولى موظف المبيعات متابعة قرار الشراء.`});
 try{const response=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${process.env.OPENAI_API_KEY}`},body:JSON.stringify({model:"gpt-5",max_output_tokens:700,input:[{role:"system",content:agent.prompt},{role:"user",content:parsed.data.message}]}),signal:AbortSignal.timeout(20_000)});if(!response.ok)return NextResponse.json({ok:false,error:"تعذر الاتصال بخدمة الذكاء الاصطناعي."},{status:502});const data=await response.json();return NextResponse.json({ok:true,mode:"live",agent:agent.name,reply:data.output_text||"لم يصل رد نصي من الموظف الافتراضي."})}catch(error){if(error instanceof Error && error.name === "TimeoutError")return NextResponse.json({ok:false,error:"استغرقت الخدمة وقتًا أطول من المتوقع. حاول مرة أخرى."},{status:504});return NextResponse.json({ok:false,error:"حدث خطأ أثناء الاتصال بالمساعد."},{status:502})}
}
