import Link from "next/link";
import { ArrowLeft, ClipboardCheck } from "lucide-react";
import MerchantApplicationForm from "./form";

export default function MerchantApplyPage() {
  return <main className="min-h-screen py-10">
    <div className="container-wide max-w-3xl">
      <Link href="/merchant" className="inline-flex items-center gap-2 text-navy font-bold"><ArrowLeft size={17}/> العودة إلى بوابة التجار</Link>
      <div className="card p-6 md:p-9 mt-6">
        <ClipboardCheck size={38} className="text-gold mb-4" />
        <h1 className="text-3xl font-black text-navy">طلب الانضمام كتاجر</h1>
        <p className="text-slate-600 leading-7 mt-3 mb-7">املأ البيانات الأساسية. الطلب يُرسل للمراجعة ولا يعني اعتماد المتجر تلقائيًا. يلزم تسجيل الدخول لإرسال الطلب وحفظه على قاعدة البيانات.</p>
        <MerchantApplicationForm />
      </div>
    </div>
  </main>;
}
