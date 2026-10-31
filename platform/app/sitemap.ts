import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const routes = ["", "/products", "/brands", "/compare", "/experts", "/merchant", "/offers", "/news", "/tips", "/academy", "/transparency", "/aux", "/ac", "/kitchen", "/lighting", "/faq", "/club", "/community", "/support", "/air-conditioner-calculator", "/energy-calculator"];
  return routes.map((route) => ({ url: `${base}${route}`, changeFrequency: "weekly" as const, priority: route === "" ? 1 : 0.6 }));
}
