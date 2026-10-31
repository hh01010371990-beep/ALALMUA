import { SectionStatus } from "@/app/_components/section-status";

export default function Page() {
  return <SectionStatus eyebrow={'الشفافية'} title={'مركز الشفافية والثقة'} description={'يوضح هذا القسم مصادر البيانات وطريقة التحقق من الأسعار والمواصفات والعروض وتجارب العملاء.'} requirements={['عرض حالة التحقق والمصدر والتاريخ.', 'منع شارات الثقة للبيانات غير المكتملة.']} />;
}
