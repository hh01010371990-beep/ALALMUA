-- Al Hazem: sales handoff and AI workforce. No checkout, payment, or order tables.
create table if not exists public.sales_leads (
 id uuid primary key default gen_random_uuid(),
 product_id uuid references public.products(id) on delete set null,
 product_name text not null,
 offer_id uuid references public.seller_offers(id) on delete set null,
 customer_name text not null,
 phone text not null,
 notes text,
 source text not null default 'product_catalog',
 status text not null default 'NEW' check (status in ('NEW','ASSIGNED','CONTACTED','QUALIFIED','CLOSED','UNREACHABLE')),
 assigned_to uuid references public.profiles(id) on delete set null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.sales_leads enable row level security;
-- Anonymous visitors can submit a lead only; no public read/update/delete.
drop policy if exists "public submit sales leads" on public.sales_leads;
create policy "public submit sales leads" on public.sales_leads for insert to anon, authenticated with check (
 length(trim(customer_name)) between 2 and 120 and length(trim(phone)) between 6 and 40 and length(trim(product_name)) between 1 and 200 and status = 'NEW' and assigned_to is null
);
drop policy if exists "admins read sales leads" on public.sales_leads;
create policy "admins read sales leads" on public.sales_leads for select to authenticated using (
 exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('SUPER_ADMIN','CEO','OPERATIONS_MANAGER','SALES_MANAGER','SALES_AGENT'))
);
create index if not exists sales_leads_status_created_idx on public.sales_leads(status, created_at desc);
create index if not exists sales_leads_phone_idx on public.sales_leads(phone);

insert into public.ai_agents (code,name,system_prompt,knowledge_scope,allowed_actions,handoff_rules,active) values
('AI-01','مستشار المبيعات','ساعد العميل في فهم احتياجه وتحديد المنتج المناسب دون ضغط أو ادعاء توفر غير مؤكد.','["catalog","customer_needs","sales_guidance"]'::jsonb,'["recommend_products","prepare_sales_handoff"]'::jsonb,'["handoff_to_human_for_final_price_or_availability","handoff_on_purchase_intent"]'::jsonb,true),
('AI-02','خبير المنتجات','اشرح المواصفات المتاحة فقط ووضّح أي بيانات ناقصة بدل تخمينها.','["product_specs","manuals","warranty"]'::jsonb,'["explain_specs","answer_product_questions"]'::jsonb,'["handoff_if_specification_is_missing"]'::jsonb,true),
('AI-03','مهندس التكييف','اجمع مساحة المكان والارتفاع والتعرض للشمس وعدد المستخدمين قبل تقديم إرشاد مبدئي للتكييف.','["air_conditioning","room_sizing","installation"]'::jsonb,'["estimate_requirements","prepare_technician_handoff"]'::jsonb,'["human_technician_confirms_installation_and_capacity"]'::jsonb,true),
('AI-04','مستشار تجهيز المنزل','ساعد في إعداد قائمة احتياجات منزلية حسب المساحة والميزانية والأولويات.','["home_setup","kitchen","household_categories"]'::jsonb,'["build_checklists","recommend_categories"]'::jsonb,'["handoff_to_sales_for_current_prices"]'::jsonb,true),
('AI-05','محلل المقارنات','قارن المنتجات باستخدام البيانات المتاحة فقط وبمعايير واضحة مثل السعر والضمان والطاقة والأبعاد.','["product_comparison","energy","dimensions","warranty"]'::jsonb,'["compare_products","summarize_tradeoffs"]'::jsonb,'["state_when_comparison_data_is_incomplete"]'::jsonb,true),
('AI-06','خدمة العملاء','أجب بلطف عن أسئلة المنصة وسجّل الحاجة إلى تدخل بشري عند الضرورة.','["faq","customer_service","platform_guidance"]'::jsonb,'["answer_faq","prepare_handoff"]'::jsonb,'["handoff_complaints_and_sensitive_cases_to_human"]'::jsonb,true),
('AI-07','مدير المحتوى','جهّز مسودات عربية دقيقة لصفحات المنتجات والإرشادات مع تجنب اختلاق المواصفات.','["content_guidelines","product_catalog"]'::jsonb,'["draft_content","suggest_seo_metadata"]'::jsonb,'["human_approval_before_publishing"]'::jsonb,true),
('AI-08','محلل البيانات','لخّص بيانات الأداء المتاحة واكتشف الاتجاهات دون اتخاذ قرارات تشغيلية منفردًا.','["platform_analytics","catalog_metrics","sales_leads_metrics"]'::jsonb,'["summarize_metrics","flag_anomalies"]'::jsonb,'["management_approval_for_business_actions"]'::jsonb,true),
('AI-09','مصمم المنزل الافتراضي','ساعد في تخطيط المساحات وفق الأبعاد الموثقة، وميّز بوضوح بين التصور والقياس الهندسي.','["virtual_home","product_dimensions","room_layout"]'::jsonb,'["suggest_layouts","explain_clearances"]'::jsonb,'["technician_verifies_installation_clearances"]'::jsonb,true),
('AI-10','مراقب جودة الكتالوج','راجع اكتمال بيانات المنتجات والعروض وروابط العلامات ونبّه إلى التناقضات.','["catalog_quality","brand_links","offer_freshness"]'::jsonb,'["flag_incomplete_records","prepare_review_queue"]'::jsonb,'["human_approval_for_price_or_product_changes"]'::jsonb,true)
on conflict (code) do update set name=excluded.name,system_prompt=excluded.system_prompt,knowledge_scope=excluded.knowledge_scope,allowed_actions=excluded.allowed_actions,handoff_rules=excluded.handoff_rules,active=true;

-- Prevent direct client-side edits to lead records. Status changes go through a checked RPC.
revoke update on public.sales_leads from anon, authenticated;

create or replace function public.update_sales_lead_status(p_lead_id uuid, p_status text)
returns public.sales_leads
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_lead public.sales_leads;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;
  select role::text into v_role from public.profiles where id = auth.uid();
  if v_role is null or v_role not in ('SUPER_ADMIN','CEO','OPERATIONS_MANAGER','SALES_MANAGER','SALES_AGENT') then
    raise exception 'Not authorized';
  end if;
  if p_status not in ('NEW','ASSIGNED','CONTACTED','QUALIFIED','CLOSED','UNREACHABLE') then
    raise exception 'Invalid lead status';
  end if;
  update public.sales_leads set status = p_status, updated_at = now()
    where id = p_lead_id returning * into v_lead;
  if not found then raise exception 'Lead not found'; end if;
  return v_lead;
end;
$$;
revoke all on function public.update_sales_lead_status(uuid, text) from public, anon;
grant execute on function public.update_sales_lead_status(uuid, text) to authenticated;

-- AI agent records are readable only when active by the public runtime; admins may manage instructions/status.
alter table public.ai_agents enable row level security;
drop policy if exists "read active AI agents" on public.ai_agents;
create policy "read active AI agents" on public.ai_agents for select to anon, authenticated
using (active = true or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('SUPER_ADMIN','CEO','OPERATIONS_MANAGER','MARKETING_MANAGER','CONTENT_MANAGER','AI_MANAGER')));
drop policy if exists "platform admins manage AI agents" on public.ai_agents;
create policy "platform admins manage AI agents" on public.ai_agents for update to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('SUPER_ADMIN','CEO','OPERATIONS_MANAGER','MARKETING_MANAGER','CONTENT_MANAGER','AI_MANAGER')))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('SUPER_ADMIN','CEO','OPERATIONS_MANAGER','MARKETING_MANAGER','CONTENT_MANAGER','AI_MANAGER')));

-- Explicit table privileges complement RLS; neither policy nor grant alone is sufficient.
grant insert on public.sales_leads to anon, authenticated;
grant select on public.sales_leads to authenticated;
revoke delete on public.sales_leads from anon, authenticated;
grant select on public.ai_agents to anon, authenticated;
grant update (name, system_prompt, active) on public.ai_agents to authenticated;
revoke insert, delete on public.ai_agents from anon, authenticated;
