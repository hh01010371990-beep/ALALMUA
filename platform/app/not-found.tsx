import Link from "next/link";
export default function NotFound() {
  return <main className="container-wide min-h-[70vh] grid place-items-center py-16"><section className="card p-10 max-w-xl text-center"><p className="text-gold font-black text-5xl">404</p><h1 className="text-3xl font-black text-navy mt-4">الصفحة غير موجودة</h1><p className="text-slate-600 leading-8 mt-3">قد يكون الرابط قد تغير أو أن الصفحة غير متاحة. يمكنك العودة إلى الصفحة الرئيسية أو استكشاف المنتجات.</p><div className="flex justify-center flex-wrap gap-3 mt-6"><Link href="/" className="rounded-lg bg-navy text-white px-5 py-3 font-bold">الرئيسية</Link><Link href="/products" className="rounded-lg border px-5 py-3 font-bold">المنتجات</Link></div></section></main>;
}
