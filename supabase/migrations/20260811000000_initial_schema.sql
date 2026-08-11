-- SmoothPoint initial schema (applied via Supabase MCP)
-- See docs/PRD-web.md section 5

CREATE TYPE plan_type AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'trialing', 'past_due', 'canceled', 'incomplete');
CREATE TYPE org_role AS ENUM ('admin', 'member');

-- Tables: profiles, organizations, subscriptions, org_memberships, org_invites
-- RLS enabled on all tables
-- Storage bucket: org-logos
