import { SectionStatus } from "@/app/_components/section-status";

export default function Page() {
  return <SectionStatus eyebrow={'الأخبار'} title={'أخبار الشركات والسوق'} description={'مساحة للأخبار المرتبطة بالشركات والعلامات والمنتجات، مع توثيق مصدر كل خبر وتاريخه.'} requirements={['إضافة مصدر موثوق ورابط وتاريخ نشر.', 'مراجعة المحتوى قبل النشر.']} />;
}
