-- ============================================================================
-- 013_lang_zh.sql — Chinese joins the site's languages (docs/03-i18n.md, D-078)
-- ============================================================================
-- The UI is EN / NE / HI / ZH. `users.lang` is written by the browser on every visit (AuthBootstrap), so its
-- CHECK must allow 'zh' before the Chinese pages ship, or a Chinese visitor's session upsert fails. `digest.lang`
-- is written by the pipeline, which still produces en/ne/hi only — zh readers fall back to the English digest —
-- but the constraint is widened here too so a Chinese digest can be added later without another migration.
-- Idempotent: constraint names are looked up rather than assumed.

do $$
declare c record;
begin
  for c in
    select conrelid::regclass as tbl, conname
    from pg_constraint
    where contype = 'c'
      and conrelid in ('users'::regclass, 'digest'::regclass)
      and pg_get_constraintdef(oid) ilike '%lang%'
  loop
    execute format('alter table %s drop constraint %I', c.tbl, c.conname);
  end loop;
end $$;

alter table users  add constraint users_lang_check  check (lang in ('en','ne','hi','zh'));
alter table digest add constraint digest_lang_check check (lang in ('en','ne','hi','zh'));

comment on column users.lang is 'Last chosen UI language: en · ne · hi · zh.';
