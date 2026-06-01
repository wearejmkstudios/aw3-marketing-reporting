# AW3 Marketing Reporting

Private Google Workspace-protected marketing reporting app for AW3 D.O.G.E.

## What This Includes

- Next.js wrapper for Vercel
- Google Workspace login via NextAuth
- Protected static reporting app at `/report/index.html`
- Historical extracted report data in `public/report/data/report-data.json`
- Monthly GitHub Actions data refresh from Google Sheets
- Vercel-ready config

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Google Workspace Login Setup

Create a Google OAuth app in Google Cloud Console:

1. Create/select a Google Cloud project.
2. Configure OAuth consent screen as internal if this is only for your Workspace.
3. Create OAuth Client ID: `Web application`.
4. Add redirect URIs:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://YOUR_DOMAIN/api/auth/callback/google`
5. Add these Vercel environment variables:
   - `NEXTAUTH_URL=https://YOUR_DOMAIN`
   - `NEXTAUTH_SECRET=<random secret>`
   - `GOOGLE_CLIENT_ID=<OAuth client id>`
   - `GOOGLE_CLIENT_SECRET=<OAuth client secret>`
   - `GOOGLE_WORKSPACE_DOMAINS=allwhitelaser.com,titaniumhero.com`

Generate `NEXTAUTH_SECRET` with:

```bash
openssl rand -base64 32
```

Only users with email addresses ending in one of the `GOOGLE_WORKSPACE_DOMAINS` values can sign in.

## GitHub + Vercel Deploy

1. Create a GitHub repo, e.g. `aw3-marketing-reporting`.
2. Commit this folder to the repo root.
3. In Vercel, import the GitHub repo.
4. Framework should auto-detect as Next.js.
5. Add the environment variables above.
6. Deploy.
7. Add your domain, e.g. `reporting.aw3.com`.

## Monthly Data Refresh Without Your Computer

The workflow in `.github/workflows/refresh-data.yml` runs:

- Manually via GitHub Actions `workflow_dispatch`
- Automatically at `09:00 UTC/GMT` on the 1st of every month

It exports the two Google Sheets as XLSX, extracts every year tab, updates:

- `public/report/data/report-data.json`
- `public/report/data/report-data.js`

Then it commits changes. Vercel redeploys automatically after the commit.

### Service Account Setup

1. Create a Google Cloud service account.
2. Enable Google Drive API.
3. Create a JSON key.
4. Share both source Google Sheets with the service account email as Viewer:
   - AW3 Financial Reports by FY
   - AW3 Marketing & RevOps/Sales Metrics by FY
5. In GitHub repo settings, add secret:
   - `GOOGLE_SERVICE_ACCOUNT_JSON`
   - Value: full JSON key content.

## Current Source Sheets

- Marketing / RevOps: `1IuErSQZMfRLlPBhiG1uudhggKqrrXDOyffMGn4QV7GI`
- Financial: `1W8q8cNgpr99vyj_VCSWl7JpOWYs__NY1vipRup35RZ8`

These IDs are configured in `scripts/extract_report_data.py`.

## Production Notes

This app is currently a private internal reporting app. The report data is shipped as frontend JSON, which is acceptable only behind Workspace login. For a public or client-facing SaaS, move data access to server-side APIs and tenant-scoped storage.
