## Vercel setup for Sistema-Agendamento

Follow these steps to deploy the app on Vercel and enable Google Sheets proxy safely.

1. Create environment variables in your Vercel project settings (Project → Settings → Environment Variables):

   - `VITE_SUPABASE_URL` = `https://<your-project>.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `<your-anon-key>`
   - `GOOGLE_SHEET_ID` = `<your-google-sheet-id>`
   - `GOOGLE_SERVICE_ACCOUNT_B64` = `<base64-encoded-service-account-json>`

   Notes:
   - `VITE_` prefixed vars are injected at build time by Vite — set them before building.
   - For `GOOGLE_SERVICE_ACCOUNT_B64`, create a base64 of your JSON:
     - Linux/macOS: `base64 -w0 path/to/service-account.json`
     - Windows PowerShell: `[Convert]::ToBase64String([IO.File]::ReadAllBytes('path\\to\\service-account.json'))`

2. Add allowed origins in Supabase (Dashboard → Settings → API → Allowed Origins):
   - `https://<your-vercel-deploy>.vercel.app`
   - `https://<your-vercel-preview>.vercel.app` (optional)

3. Deploy: Trigger a new deploy in Vercel after setting env vars.

4. The serverless function `/api/sheets` will run on Vercel and use `GOOGLE_SERVICE_ACCOUNT_B64` to authenticate.

Security note: Never commit the service-account JSON into the repo. Use base64 env var or a secret manager.
