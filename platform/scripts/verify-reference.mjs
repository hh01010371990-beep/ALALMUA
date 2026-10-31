import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const requiredRoutes = [
  'app/page.tsx', 'app/products/page.tsx', 'app/brands/page.tsx', 'app/compare/page.tsx',
  'app/offers/page.tsx', 'app/news/page.tsx', 'app/tips/page.tsx', 'app/academy/page.tsx',
  'app/transparency/page.tsx', 'app/aux/page.tsx', 'app/ac/page.tsx', 'app/kitchen/page.tsx',
  'app/lighting/page.tsx', 'app/faq/page.tsx', 'app/club/page.tsx', 'app/community/page.tsx',
  'app/support/page.tsx', 'app/air-conditioner-calculator/page.tsx', 'app/not-found.tsx',
];
const requiredMigrations = [1, 2, 3, 4, 5].map((n) => `database/migrations/${String(n).padStart(3, '0')}_${[
  'core', 'merchant_portal', 'sales_handoff_ai_workforce', 'catalog_admin_security', 'sales_lead_input_hardening'
][n - 1]}.sql`);
const missing = [...requiredRoutes, ...requiredMigrations].filter((file) => !existsSync(join(process.cwd(), file)));
const siteConfig = readFileSync(join(process.cwd(), 'lib/config/site.ts'), 'utf8');
const homepage = readFileSync(join(process.cwd(), 'app/page.tsx'), 'utf8');
const checks = [
  ['Central company identity configuration', siteConfig.includes('01050509779') && siteConfig.includes('01044111143')],
  ['AUX section appears before the homepage footer', homepage.indexOf('href="/aux"') >= 0 && homepage.indexOf('href="/aux"') < homepage.indexOf('<footer')],
  ['No cart or payment flow introduced', !existsSync(join(process.cwd(), 'app/checkout/page.tsx'))],
];
if (missing.length) {
  console.error('Missing required files:', missing.join(', '));
  process.exitCode = 1;
}
for (const [label, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`);
if (checks.some(([, ok]) => !ok)) process.exitCode = 1;
