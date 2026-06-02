# Scaling AW3® | RevOps Dashboard | Powered by D.O.G.E. Into A SaaS

## Recommended SaaS Architecture

Use this internal app as the prototype, then split the product into clear layers:

- **App:** Next.js on Vercel
- **Auth:** Google OAuth plus email/password or SSO
- **Teams/tenants:** Organization model in database
- **Data:** Postgres for structured report data
- **Files:** Object storage for generated decks/PDFs
- **Jobs:** Queue or scheduled workers for monthly refreshes
- **AI chat:** Server-side API route with tenant-scoped retrieval
- **Billing:** Stripe subscriptions and metered usage

## Multi-Tenant Data Model

Core tables:

- `users`: identity, name, email
- `organizations`: client/team account
- `memberships`: user-to-organization role mapping
- `data_sources`: Salesforce, Meta Ads, Google Ads, Sheets, Shopify, etc.
- `report_periods`: month, quarter, year, status
- `metrics`: normalized metric facts by org/date/channel/source
- `reports`: generated report metadata
- `report_artifacts`: links to web snapshots, PDFs, slide decks
- `chat_threads`: AI conversations scoped to org/report
- `audit_logs`: security and data access trail

Every row that contains client data should include `organization_id`.

## Authentication And Teams

Start with:

- Google Workspace login
- Invite-only teams
- Roles: `owner`, `admin`, `analyst`, `viewer`

For larger clients:

- SAML/SSO
- SCIM provisioning
- Domain capture / verified domains
- Mandatory MFA via IdP

## Data Integrations

For each client, support connectors:

- Salesforce OAuth
- Google Ads OAuth
- Meta Ads OAuth
- Google Sheets import
- CSV upload fallback

Do not put client API tokens in frontend JSON. Store encrypted tokens server-side.

## Reporting Pipeline

Monthly flow:

1. Scheduled job starts for each active organization.
2. Pull raw source data.
3. Normalize into canonical metrics.
4. Run validation checks.
5. Generate insight summaries.
6. Publish web report.
7. Generate slide/PDF artifacts if enabled.
8. Notify users by email/Slack.

## AI Chat At SaaS Scale

Do not let the model query unrestricted databases. Use a constrained report context:

- Selected organization
- Selected report period
- Normalized metric rows
- Precomputed comparisons
- Known data-quality flags

The chat API should:

- Enforce user membership and role
- Load only tenant-scoped data
- Log prompts and responses
- Refuse unavailable data rather than guessing
- Return citations to metric rows/periods where possible

## Security Checklist

- Tenant isolation everywhere
- Server-side data access only
- Encrypted OAuth tokens
- Least-privilege connector scopes
- Audit logs for data views/exports
- Rate limits on AI chat
- Backups and retention policy
- Data deletion workflow per client

## Pricing Shape

Simple SaaS packaging:

- **Starter:** 1 workspace, Sheets/CSV, monthly web reports
- **Growth:** Ads + CRM connectors, AI chat, slide/PDF export
- **Scale:** SSO, multiple brands, custom metrics, Slack/email delivery
- **Enterprise:** dedicated support, custom data warehouse, security reviews

## Practical Build Path

1. Ship AW3® internal app on Vercel with Workspace login.
2. Move report data from frontend JSON to Postgres.
3. Add organizations and memberships.
4. Add server-side AI chat.
5. Add connector OAuth for Google Ads, Meta Ads, Salesforce.
6. Add billing and team management.
7. Add export/share workflows.
