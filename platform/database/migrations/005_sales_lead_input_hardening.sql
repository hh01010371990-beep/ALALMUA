-- Al Hazem Smart v9.1 Phase 2 hardening.
-- Apply only after reviewing the target schema and taking a database backup.

-- Historical timestamps written by the merchant portal were generated during offer
-- submission, not by an independent verification process. Clear those timestamps so
-- the UI does not imply verification without evidence. Back up first; this is not reversible.
update public.seller_offers
set last_price_verified_at = null
where price_source = 'merchant_portal'
  and last_price_verified_at is not null;

-- Defense in depth: keep direct Supabase inserts consistent with the API contract.
do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'sales_leads_source_allowed'
  ) then
    alter table public.sales_leads
      add constraint sales_leads_source_allowed
      check (source in ('product_catalog'));
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'sales_leads_notes_length'
  ) then
    alter table public.sales_leads
      add constraint sales_leads_notes_length
      check (notes is null or length(notes) <= 1000);
  end if;
end $$;

-- Recreate the public insert policy with all fields constrained, not just identity/product text.
drop policy if exists "public submit sales leads" on public.sales_leads;
create policy "public submit sales leads"
on public.sales_leads for insert to anon, authenticated
with check (
  length(trim(customer_name)) between 2 and 120
  and length(trim(phone)) between 6 and 40
  and length(trim(product_name)) between 1 and 200
  and (notes is null or length(notes) <= 1000)
  and source = 'product_catalog'
  and status = 'NEW'
  and assigned_to is null
);
