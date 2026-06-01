# Deployment Checklist

Use this when shipping AW3 Marketing Reporting to GitHub and Vercel.

## 1. Push To GitHub

- Create a new private GitHub repository.
- Put the contents of this folder at the repository root.
- Commit and push the first version.

## 2. Configure Google Workspace Login

- Create a Google Cloud OAuth client for a web application.
- Add local redirect URI: `http://localhost:3000/api/auth/callback/google`.
- Add production redirect URI: `https://YOUR_DOMAIN/api/auth/callback/google`.
- In Vercel, add:
  - `NEXTAUTH_URL`
  - `NEXTAUTH_SECRET`
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `GOOGLE_WORKSPACE_DOMAINS=allwhitelaser.com,titaniumhero.com`

## 3. Configure Monthly Data Refresh

- Create a Google Cloud service account.
- Enable Google Drive API.
- Create a service account JSON key.
- Share both source Google Sheets with the service account email as Viewer.
- Add GitHub secret `GOOGLE_SERVICE_ACCOUNT_JSON` with the full JSON key.
- Run the `Refresh report data` GitHub Action manually once.
- Confirm it commits updated files under `public/report/data/`.

## 4. Deploy On Vercel

- Import the GitHub repository into Vercel.
- Confirm framework is detected as Next.js.
- Add production environment variables.
- Deploy.
- Visit `/report/index.html`.
- Sign in with an allowed Google Workspace account.

## 5. Verify Production

- Check Workspace users can sign in.
- Check non-Workspace users are rejected.
- Confirm historical data loads.
- Test month, quarter, YoY, and FY tabs.
- Test the AI chat prototype.
- Confirm the next scheduled GitHub Action is `0 9 1 * *`, meaning 09:00 UTC/GMT on the 1st of each month.
