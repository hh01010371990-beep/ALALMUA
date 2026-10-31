export default function VirtualHomePage() {
  return <main className="container-wide py-10">
    <h1 className="text-4xl font-black text-navy">المنزل الافتراضي</h1>
    <p className="text-slate-600 mt-3">هذه هي واجهة البداية للمحرك الذي سيعرض المنتجات داخل غرف قابلة للتخصيص.</p>
    <div className="card mt-8 min-h-[420px] bg-slate-100 grid place-items-center">
      <div className="text-center">
        <div className="text-7xl mb-5">🏠</div>
        <h2 className="text-2xl font-black">مساحة المنزل الافتراضي</h2>
        <p className="text-slate-500 mt-2">الغرف والأبعاد والمنتجات ثلاثية الأبعاد تُدار من قاعدة البيانات.</p>
      </div>
    </div>
  </main>;
}