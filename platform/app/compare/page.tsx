import Link from "next/link";
import ComparisonTool from "./comparison-tool";

export default function ComparePage() {
  return <main className="container-wide py-10">
    <Link href="/products" className="text-navy font-bold">← العودة إلى المنتجات</Link>
    <div className="mt-7 mb-8">
      <p className="text-gold font-bold">اختيار مبني على احتياجك</p>
      <h1 className="text-4xl font-black text-navy mt-2">المقارنة الذكية</h1>
      <p className="text-slate-600 mt-3 leading-7 max-w-3xl">اختر منتجين أو ثلاثة من الكتالوج وقارن الأسعار والمواصفات والأبعاد والضمان واستهلاك الكهرباء. المعلومات غير المتاحة ستظهر بوضوح بدلًا من تخمينها.</p>
    </div>
    <ComparisonTool />
  </main>;
}
