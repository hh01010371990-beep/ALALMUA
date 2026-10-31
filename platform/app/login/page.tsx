export default function LoginPage() {
  return <main className="min-h-screen grid place-items-center bg-slate-100 p-5">
    <form className="card p-8 w-full max-w-md">
      <h1 className="text-3xl font-black text-navy">دخول المنصة</h1>
      <p className="text-slate-500 mt-2">واجهة الدخول جاهزة للربط مع Supabase Auth.</p>
      <input className="w-full border rounded-xl p-3 mt-6" type="email" placeholder="البريد الإلكتروني" />
      <input className="w-full border rounded-xl p-3 mt-3" type="password" placeholder="كلمة المرور" />
      <button className="w-full bg-navy text-white rounded-xl p-3 mt-4 font-bold">دخول</button>
    </form>
  </main>;
}