-- Lock down anonymous Data API access.
-- Run this after confirming authenticated role tests pass.

begin;

-- RLS policies already target authenticated, but explicit grants may still let anon
-- reach tables if older policies/grants exist. Remove all table privileges for anon.
revoke all privileges on all tables in schema public from anon;
revoke all privileges on all sequences in schema public from anon;
revoke all privileges on all functions in schema public from anon;

-- Keep authenticated able to use the exposed public schema.
grant usage on schema public to authenticated;

-- If your project depends on public RPCs for unauthenticated users, grant those
-- functions back one by one instead of broad grants.

commit;
