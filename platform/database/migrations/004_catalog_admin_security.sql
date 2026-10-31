-- Product/brand administration, catalog filters and security hardening.
-- Apply after migrations 001-003. Review policies in a staging Supabase project first.

alter table public.brands add column if not exists logo_url text;
alter table public.brands add column if not exists facebook_url text;
alter table public.brands add column if not exists instagram_url text;
alter table public.brands add column if not exists tiktok_url text;
alter table public.brands add column if not exists official_support_url text;
alter table public.brands add column if not exists updated_at timestamptz not null default now();

alter table public.products add column if not exists model_number text;
alter table public.products add column if not exists sku text;
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'is_published'
  ) then
    alter table public.products add column is_published boolean not null default false;
    -- Preserve visibility for products that existed before this migration; future products remain drafts.
    update public.products set is_published = true;
  end if;
end $$;
alter table public.products add column if not exists updated_at timestamptz not null default now();
alter table public.product_media add column if not exists is_primary boolean not null default false;
alter table public.product_media add column if not exists created_at timestamptz not null default now();

create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists products_brand_id_idx on public.products(brand_id);
create index if not exists products_published_updated_idx on public.products(is_published, updated_at desc);
create index if not exists product_specifications_product_idx on public.product_specifications(product_id);
create index if not exists product_media_product_idx on public.product_media(product_id);
create index if not exists brands_name_lower_idx on public.brands(lower(name));
create index if not exists seller_offers_price_verified_idx on public.seller_offers(last_price_verified_at desc);

-- Repair the previously seeded generic Toshiba URL and add verified regional official sites.
update public.brands set website = 'https://www.toshiba-lifestyle.com/eg-ar', description = 'أجهزة منزلية وخدمة العملاء في مصر'
where name = 'TOSHIBA' and website = 'https://www.toshiba.com';
update public.brands set website = null where (name = 'AUX' and website = 'https://auxairconditioner.com') or (name = 'SHARP' and website = 'https://sharp-world.com') or (name = 'Carrier' and website = 'https://www.carrier.com/egypt');
insert into public.brands (name, description, website) values
('Beko Egypt', 'الأجهزة المنزلية في مصر', 'https://www.beko.com/eg-ar'),
('Miraco', 'حلول التكييف والتبريد في مصر', 'https://miraco.com.eg/')
on conflict (name) do nothing;

-- Public catalog reads only published products; admins retain access to drafts.
drop policy if exists "public can read products" on public.products;
drop policy if exists "public reads published products" on public.products;
create policy "public reads published products" on public.products for select to anon, authenticated
using (is_published = true);
drop policy if exists "admins read all products" on public.products;
create policy "admins read all products" on public.products for select to authenticated using (public.is_platform_admin());

drop policy if exists "admins manage products" on public.products;
create policy "admins manage products" on public.products for all to authenticated
using (public.is_platform_admin()) with check (public.is_platform_admin());

alter table public.brands enable row level security;
alter table public.categories enable row level security;
alter table public.product_specifications enable row level security;
alter table public.product_media enable row level security;

drop policy if exists "public reads brands" on public.brands;
create policy "public reads brands" on public.brands for select to anon, authenticated using (true);
drop policy if exists "admins manage brands" on public.brands;
create policy "admins manage brands" on public.brands for all to authenticated
using (public.is_platform_admin()) with check (public.is_platform_admin());
drop policy if exists "public reads categories" on public.categories;
create policy "public reads categories" on public.categories for select to anon, authenticated using (true);
drop policy if exists "admins manage categories" on public.categories;
create policy "admins manage categories" on public.categories for all to authenticated
using (public.is_platform_admin()) with check (public.is_platform_admin());
drop policy if exists "public reads specifications for published products" on public.product_specifications;
create policy "public reads specifications for published products" on public.product_specifications for select to anon, authenticated
using (exists (select 1 from public.products p where p.id = product_id and p.is_published = true));
drop policy if exists "admins manage product specifications" on public.product_specifications;
create policy "admins manage product specifications" on public.product_specifications for all to authenticated
using (public.is_platform_admin()) with check (public.is_platform_admin());
drop policy if exists "public reads media for published products" on public.product_media;
create policy "public reads media for published products" on public.product_media for select to anon, authenticated
using (exists (select 1 from public.products p where p.id = product_id and p.is_published = true));
drop policy if exists "admins manage product media" on public.product_media;
create policy "admins manage product media" on public.product_media for all to authenticated
using (public.is_platform_admin()) with check (public.is_platform_admin());

-- Product images are stored in a dedicated public-read bucket; only platform admins may upload/update/delete.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('alhazem-product-media', 'alhazem-product-media', true, 5242880, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg','image/png','image/webp','image/avif'];

drop policy if exists "public reads alhazem product media" on storage.objects;
create policy "public reads alhazem product media" on storage.objects for select to anon, authenticated
using (bucket_id = 'alhazem-product-media');
drop policy if exists "admins upload alhazem product media" on storage.objects;
create policy "admins upload alhazem product media" on storage.objects for insert to authenticated
with check (bucket_id = 'alhazem-product-media' and public.is_platform_admin());
drop policy if exists "admins update alhazem product media" on storage.objects;
create policy "admins update alhazem product media" on storage.objects for update to authenticated
using (bucket_id = 'alhazem-product-media' and public.is_platform_admin())
with check (bucket_id = 'alhazem-product-media' and public.is_platform_admin());
drop policy if exists "admins delete alhazem product media" on storage.objects;
create policy "admins delete alhazem product media" on storage.objects for delete to authenticated
using (bucket_id = 'alhazem-product-media' and public.is_platform_admin());

-- Trigger keeps timestamps fresh on product/brand edits.
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;
drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products for each row execute function public.set_updated_at();
drop trigger if exists brands_set_updated_at on public.brands;
create trigger brands_set_updated_at before update on public.brands for each row execute function public.set_updated_at();

-- Record administrative product/brand changes for traceability.
create or replace function public.audit_catalog_change()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if tg_op = 'INSERT' then
    insert into public.audit_logs(actor_id, entity_type, entity_id, action, old_data, new_data)
    values (auth.uid(), tg_table_name, new.id, 'CREATE', null, to_jsonb(new));
    return new;
  elsif tg_op = 'UPDATE' then
    insert into public.audit_logs(actor_id, entity_type, entity_id, action, old_data, new_data)
    values (auth.uid(), tg_table_name, new.id, 'UPDATE', to_jsonb(old), to_jsonb(new));
    return new;
  else
    insert into public.audit_logs(actor_id, entity_type, entity_id, action, old_data, new_data)
    values (auth.uid(), tg_table_name, old.id, 'DELETE', to_jsonb(old), null);
    return old;
  end if;
end;
$$;
drop trigger if exists audit_products_changes on public.products;
create trigger audit_products_changes after insert or update or delete on public.products
for each row execute function public.audit_catalog_change();
drop trigger if exists audit_brands_changes on public.brands;
create trigger audit_brands_changes after insert or update or delete on public.brands
for each row execute function public.audit_catalog_change();
