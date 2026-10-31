import { SectionStatus } from "@/app/_components/section-status";

export default function Page() {
  return <SectionStatus eyebrow={'الملف الشخصي'} title={'ملف العميل'} description={'منطقة لإدارة بيانات العميل وطلباته وموافقاته، وفق سياسة خصوصية واضحة.'} requirements={['تفعيل التسجيل والتحقق من الهاتف.', 'موافقة تسويقية منفصلة وقابلة للإلغاء.']} />;
}
