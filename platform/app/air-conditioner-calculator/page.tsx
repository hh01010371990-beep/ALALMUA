import { SectionStatus } from "@/app/_components/section-status";

export default function Page() {
  return <SectionStatus eyebrow={'حاسبة التكييف'} title={'حاسبة القدرة التقديرية للتكييف'} description={'هذه الحاسبة مستقلة عن حاسبة استهلاك الكهرباء. لن تُصدر توصية رقمية قبل اعتماد معادلة هندسية وحدود استخدامها من مختص.'} requirements={['اعتماد منهج الحساب والوحدات.', 'اختبار الحالات المختلفة ومراجعة مهندس تكييف.']} />;
}
