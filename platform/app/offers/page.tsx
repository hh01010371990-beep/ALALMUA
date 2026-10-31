import { SectionStatus } from "@/app/_components/section-status";

export default function Page() {
  return <SectionStatus eyebrow={'العروض'} title={'العروض والفرص'} description={'يعرض هذا القسم العروض التي تعتمدها الإدارة بعد التحقق من السعر والمصدر وفترة الصلاحية.'} requirements={['تسجيل العرض ومصدره وتاريخ رصده وصلاحيته.', 'مراجعة السعر قبل النشر وعدم وصف أي عرض بأنه مؤكد دون دليل.']} />;
}
