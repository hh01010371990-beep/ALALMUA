/** Central public company identity. Values follow the approved master reference document. */
function cleanPhone(value: string) { return value.replace(/[^0-9+]/g, ""); }

export const siteConfig = {
  brand: "الحازم جروب",
  platform: "الحازم سمارت",
  company: "العالمية للأجهزة الكهربائية وخدمات التكييف والأدوات المنزلية والنجف والتحف",
  address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "سيدي غازي، كفر الشيخ، مصر — أمام موقف الميكروباص",
  // Reference document values: phone 01050509779, WhatsApp 01044111143.
  phone: cleanPhone(process.env.NEXT_PUBLIC_SALES_PHONE || "01050509779"),
  whatsapp: cleanPhone(process.env.NEXT_PUBLIC_SALES_WHATSAPP || "01044111143"),
  colors: { navy: "#091329", gold: "#C79529", warmWhite: "#F5F4F0" },
} as const;

export function whatsappUrl(message?: string) {
  let number = siteConfig.whatsapp.replace(/\D/g, "");
  // Convert Egyptian local mobile format (01xxxxxxxxx) to WhatsApp country format (201xxxxxxxxx).
  if (number.startsWith("0") && number.length === 11) number = `20${number.slice(1)}`;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${number}${text}`;
}
