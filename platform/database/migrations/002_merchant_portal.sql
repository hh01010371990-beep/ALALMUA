-- Merchant portal foundation for Al Hazem Marketplace.
-- Apply after 001_core.sql. Review against the target Supabase project before production.

alter table sellers
  add column if not exists phone text,
  add column if not exists business_category text,
  add column if not exists address text,
  add column if not exists description text,
  add column if not exists logo_url text,
  add column if not exists submitted_at timestamptz,
  add column if not exists reviewed_at timestamptz,
  add column if not exists review_note text;

alter table stores
  add column if not exists is_active boolean not null default false,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table seller_offers
  add column if not exists is_available boolean not null default true,
  add column if not exists currency_code text not null default 'EGP',
  add column if not exists delivery_fee numeric,
  add column if not exists price_source text,
  add column if not exists last_price_verified_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'seller_offers_price_nonnegative') then
    alter table seller_offers add constraint seller_offers_price_nonnegative check (price >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'seller_offers_compare_price_nonnegative') then
    alter table seller_offers add constraint seller_offers_compare_price_nonnegative check (compare_at_price is null or compare_at_price >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'seller_offers_stock_nonnegative') then
    alter table seller_offers add constraint seller_offers_stock_nonnegative check (stock_quantity >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'seller_offers_delivery_fee_nonnegative') then
    alter table seller_offers add constraint seller_offers_delivery_fee_nonnegative check (delivery_fee is null or delivery_fee >= 0);
  end if;
end $$;

-- A user may have only one marketplace seller profile; this also prevents duplicate submissions.
create unique index if not exists sellers_one_marketplace_profile_per_owner
  on sellers(owner_id) where seller_type = 'MARKETPLACE_SELLER' and owner_id is not null;

create index if not exists sellers_owner_id_idx on sellers(owner_id);
create index if not exists sellers_status_idx on sellers(status);
create index if not exists stores_seller_id_idx on stores(seller_id);
create index if not exists seller_offers_product_id_idx on seller_offers(product_id);
create index if not exists seller_offers_seller_id_idx on seller_offers(seller_id);

-- SECURITY DEFINER avoids recursive profiles RLS checks when determining admin status.
create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('SUPER_ADMIN','CEO','OPERATIONS_MANAGER','SALES_MANAGER','MARKETING_MANAGER','CONTENT_MANAGER','AI_MANAGER')
  );
$$;
revoke all on function public.is_platform_admin() from public;
grant execute on function public.is_platform_admin() to authenticated;

alter table stores enable row level security;
alter table seller_offers enable row level security;

-- Seller application: the authenticated user may create only their own pending marketplace application.
drop policy if exists "seller owner creates pending application" on sellers;
create policy "seller owner creates pending application"
on sellers for insert to authenticated
with check (
  owner_id = auth.uid()
  and seller_type = 'MARKETPLACE_SELLER'
  and status = 'PENDING'
);

drop policy if exists "seller owner reads own application" on sellers;
create policy "seller owner reads own application"
on sellers for select to authenticated
using (owner_id = auth.uid() or public.is_platform_admin());

drop policy if exists "platform admins update seller applications" on sellers;
create policy "platform admins update seller applications"
on sellers for update to authenticated
using (public.is_platform_admin())
with check (public.is_platform_admin());

-- Store owners may read their own stores. Public sees only active stores from approved sellers.
drop policy if exists "public reads active approved stores" on stores;
create policy "public reads active approved stores"
on stores for select to anon, authenticated
using (
  is_active = true and exists (
    select 1 from sellers s where s.id = stores.seller_id and s.status = 'APPROVED'
  )
);
drop policy if exists "seller owner reads own stores" on stores;
create policy "seller owner reads own stores"
on stores for select to authenticated
using (exists (select 1 from sellers s where s.id = stores.seller_id and s.owner_id = auth.uid()) or public.is_platform_admin());
drop policy if exists "approved seller manages own stores" on stores;
create policy "approved seller manages own stores"
on stores for all to authenticated
using (
  exists (select 1 from sellers s where s.id = stores.seller_id and s.owner_id = auth.uid() and s.status = 'APPROVED')
  or public.is_platform_admin()
)
with check (
  exists (select 1 from sellers s where s.id = stores.seller_id and s.owner_id = auth.uid() and s.status = 'APPROVED')
  or public.is_platform_admin()
);

-- Replace the original broad public offer policy with visibility rules for approved sellers.
drop policy if exists "public can read offers" on seller_offers;
create policy "public reads available offers from approved sellers"
on seller_offers for select to anon, authenticated
using (
  is_available = true and exists (
    select 1 from sellers s where s.id = seller_offers.seller_id and s.status = 'APPROVED'
  )
);
drop policy if exists "seller owner reads own offers" on seller_offers;
create policy "seller owner reads own offers"
on seller_offers for select to authenticated
using (exists (select 1 from sellers s where s.id = seller_offers.seller_id and s.owner_id = auth.uid()) or public.is_platform_admin());
drop policy if exists "approved seller manages own offers" on seller_offers;
create policy "approved seller manages own offers"
on seller_offers for all to authenticated
using (
  exists (select 1 from sellers s where s.id = seller_offers.seller_id and s.owner_id = auth.uid() and s.status = 'APPROVED')
  or public.is_platform_admin()
)
with check (
  exists (select 1 from sellers s where s.id = seller_offers.seller_id and s.owner_id = auth.uid() and s.status = 'APPROVED')
  or public.is_platform_admin()
);

-- Product listing requests are deliberately separate from products: new products require editorial/admin review.
create table if not exists merchant_product_submissions (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references sellers(id) on delete cascade,
  proposed_name text not null,
  brand_name text,
  category_name text not null,
  description text,
  suggested_specs jsonb not null default '{}'::jsonb,
  image_urls jsonb not null default '[]'::jsonb,
  status text not null default 'PENDING' check (status in ('PENDING','UNDER_REVIEW','APPROVED','REJECTED')),
  review_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);
alter table merchant_product_submissions enable row level security;
drop policy if exists "seller submits product for review" on merchant_product_submissions;
create policy "seller submits product for review"
on merchant_product_submissions for insert to authenticated
with check (
  exists (select 1 from sellers s where s.id = merchant_product_submissions.seller_id and s.owner_id = auth.uid() and s.status = 'APPROVED')
);
drop policy if exists "seller reads own product submissions" on merchant_product_submissions;
create policy "seller reads own product submissions"
on merchant_product_submissions for select to authenticated
using (exists (select 1 from sellers s where s.id = merchant_product_submissions.seller_id and s.owner_id = auth.uid()) or public.is_platform_admin());
drop policy if exists "admins review product submissions" on merchant_product_submissions;
create policy "admins review product submissions"
on merchant_product_submissions for update to authenticated
using (public.is_platform_admin())
with check (public.is_platform_admin());

-- Only platform admins may activate/deactivate a storefront or transfer it between sellers.
create or replace function public.guard_store_activation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_platform_admin() then
    if (tg_op = 'INSERT' and new.is_active = true)
       or (tg_op = 'UPDATE' and ((old.is_active = false and new.is_active = true) or old.seller_id <> new.seller_id)) then
      raise exception 'Only platform administrators may activate a store or change its seller';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists guard_store_activation_trigger on stores;
create trigger guard_store_activation_trigger
before insert or update on stores
for each row execute function public.guard_store_activation();


-- Keep an immutable audit trail for seller approval-state changes.
create or replace function public.audit_seller_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is distinct from new.status or old.review_note is distinct from new.review_note then
    insert into public.audit_logs(actor_id, entity_type, entity_id, action, old_data, new_data)
    values (
      auth.uid(), 'seller', new.id, 'SELLER_REVIEW_UPDATED',
      jsonb_build_object('status', old.status, 'review_note', old.review_note),
      jsonb_build_object('status', new.status, 'review_note', new.review_note, 'reviewed_at', new.reviewed_at)
    );
  end if;
  return new;
end;
$$;

drop trigger if exists audit_seller_status_change_trigger on sellers;
create trigger audit_seller_status_change_trigger
after update on sellers
for each row execute function public.audit_seller_status_change();

-- Store profile fields and one storefront per marketplace seller.
alter table stores
  add column if not exists phone text,
  add column if not exists whatsapp text,
  add column if not exists city text,
  add column if not exists address text,
  add column if not exists logo_url text,
  add column if not exists delivery_policy text,
  add column if not exists return_policy text;

create unique index if not exists stores_one_store_per_seller_idx on stores(seller_id);
