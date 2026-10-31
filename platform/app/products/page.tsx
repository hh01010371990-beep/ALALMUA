import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";
import ProductCatalog from "./product-catalog";
export default function ProductsPage() {
  return <main className="container-wide py-10"><Link href="/" className="text-navy font-bold">← الرئيسية</Link><div className="flex flex-wrap items-end justify-between gap-4 mt-8 mb-7"><div><h1 className="text-4xl font-black text-navy">المنتجات واستشارة المبيعات</h1><p className="text-slate-600 mt-3">استعرض المنتجات ومواصفاتها وأسعارها المتاحة، ثم اطلب التواصل مع موظف المبيعات لمتابعة قرار الشراء خارج المنصة.</p></div><Link href="/compare" className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 font-bold text-navy"><ArrowLeftRight size={18}/> قارن المنتجات</Link></div><ProductCatalog /></main>;
}
