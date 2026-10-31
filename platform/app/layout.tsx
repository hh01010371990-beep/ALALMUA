import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "الحازم سمارت | قبل ما تشتري… اسأل الحازم", template: "%s | الحازم سمارت" },
  description: "مركز قرار ذكي يساعد الأسرة المصرية على اختيار الأجهزة الكهربائية والتكييفات والأدوات المنزلية بمعلومات موثقة ومقارنات عادلة واستشارات مخصصة.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: { type: "website", locale: "ar_EG", siteName: "الحازم سمارت", title: "الحازم سمارت", description: "قبل ما تشتري… اسأل الحازم" },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}