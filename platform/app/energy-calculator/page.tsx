"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Calculator, Zap, Info } from "lucide-react";

const money = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 2 });

export default function EnergyCalculatorPage() {
  const [watts, setWatts] = useState("1500");
  const [hours, setHours] = useState("4");
  const [days, setDays] = useState("30");
  const [quantity, setQuantity] = useState("1");
  const [rate, setRate] = useState("2.5");

  const result = useMemo(() => {
    const w = Number(watts), h = Number(hours), d = Number(days), q = Number(quantity), r = Number(rate);
    if (![w, h, d, q, r].every(Number.isFinite) || w < 0 || h < 0 || d < 0 || q < 0 || r < 0 || h > 24 || d > 31) return null;
    const kwh = (w / 1000) * h * d * q;
    return { kwh, cost: kwh * r };
  }, [watts, hours, days, quantity, rate]);

  const fields = [
    { label: "قدرة الجهاز بالوات", value: watts, set: setWatts, min: 0, max: 100000, step: 1 },
    { label: "ساعات التشغيل يوميًا", value: hours, set: setHours, min: 0, max: 24, step: 0.5 },
    { label: "أيام التشغيل في الشهر", value: days, set: setDays, min: 0, max: 31, step: 1 },
    { label: "عدد الأجهزة", value: quantity, set: setQuantity, min: 0, max: 1000, step: 1 },
    { label: "سعر الكيلووات/ساعة بالجنيه", value: rate, set: setRate, min: 0, max: 10000, step: 0.01 },
  ];

  return (
    <main className="container-wide py-10">
      <Link href="/" className="inline-flex items-center gap-2 font-bold text-navy"><ArrowRight size={18}/> الرئيسية</Link>
      <div className="mt-8 max-w-3xl">
        <p className="font-bold text-amber-700">أدوات الحازم الذكية</p>
        <h1 className="mt-2 text-4xl font-black text-navy">حاسبة استهلاك الكهرباء</h1>
        <p className="mt-3 leading-8 text-slate-600">قدّر استهلاك الجهاز وتكلفته الشهرية بناءً على قدرة الجهاز وساعات الاستخدام وسعر الكيلووات الذي تدخله بنفسك.</p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <section className="card p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3"><Calculator className="text-amber-600" size={28}/><h2 className="text-xl font-black text-navy">بيانات الحساب</h2></div>
          <div className="grid gap-5 sm:grid-cols-2">
            {fields.map((field) => <label key={field.label} className="block text-sm font-bold text-slate-700">{field.label}<input type="number" inputMode="decimal" min={field.min} max={field.max} step={field.step} value={field.value} onChange={(e) => field.set(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-base outline-none focus:border-amber-500" /></label>)}
          </div>
          <div className="mt-6 flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-950"><Info size={20} className="mt-1 shrink-0"/><p>استخدم قدرة الجهاز المكتوبة على ملصق المواصفات. سعر الكهرباء يختلف حسب الشريحة والتعريفة؛ أدخل السعر المناسب لفاتورتك. الحساب تقديري ولا يشمل اختلافات التشغيل الفعلية أو الرسوم الثابتة.</p></div>
        </section>
        <section className="rounded-2xl bg-navy p-6 text-white md:p-8">
          <Zap className="mb-4 text-amber-400" size={32}/><h2 className="text-xl font-black">النتيجة التقديرية</h2>
          {result ? <>
            <p className="mt-6 text-sm text-slate-300">الاستهلاك الشهري</p><p className="mt-1 text-3xl font-black">{money.format(result.kwh)} <span className="text-base font-bold">كيلووات/ساعة</span></p>
            <div className="my-6 h-px bg-white/15"/>
            <p className="text-sm text-slate-300">التكلفة الشهرية التقديرية</p><p className="mt-1 text-3xl font-black text-amber-400">{money.format(result.cost)} <span className="text-base font-bold">جنيه</span></p>
            <p className="mt-5 text-sm leading-6 text-slate-300">المعادلة: القدرة بالوات ÷ 1000 × ساعات التشغيل اليومية × أيام الشهر × عدد الأجهزة.</p>
          </> : <p className="mt-5 text-sm text-slate-300">أدخل أرقامًا صحيحة ضمن الحدود لعرض النتيجة.</p>}
          <Link href="/products" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 font-black text-navy">استكشف المنتجات <ArrowRight size={18}/></Link>
        </section>
      </div>
    </main>
  );
}
