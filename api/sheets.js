import { google } from 'googleapis'

// Vercel Serverless function to read Google Sheets using a service account stored
// in the environment as BASE64 JSON (GOOGLE_SERVICE_ACCOUNT_B64).

export default async function handler(req, res) {
  const start = Date.now();
  const requestId = Math.random().toString(36).slice(2, 9);
  console.info(`[sheets:${requestId}] request ${req.method} ${req.url} start`);

  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const serviceAccountB64 = process.env.GOOGLE_SERVICE_ACCOUNT_B64;

    console.info(`[sheets:${requestId}] env: GOOGLE_SHEET_ID=${!!spreadsheetId}, GOOGLE_SERVICE_ACCOUNT_B64=${!!serviceAccountB64}`);

    if (!spreadsheetId) {
      console.error(`[sheets:${requestId}] missing GOOGLE_SHEET_ID`);
      res.status(500).json({ error: 'Missing GOOGLE_SHEET_ID environment variable.' });
      return;
    }

    if (!serviceAccountB64) {
      console.error(`[sheets:${requestId}] missing GOOGLE_SERVICE_ACCOUNT_B64`);
      res.status(500).json({ error: 'Missing GOOGLE_SERVICE_ACCOUNT_B64 environment variable.' });
      return;
    }

    let serviceAccount;
    try {
      serviceAccount = JSON.parse(Buffer.from(serviceAccountB64, 'base64').toString('utf8'));
    } catch (err) {
      console.error(`[sheets:${requestId}] failed to parse service account:`, err);
      res.status(500).json({ error: 'Failed to parse GOOGLE_SERVICE_ACCOUNT_B64: ' + String(err.message) });
      return;
    }

    const jwtClient = new google.auth.JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })

    await jwtClient.authorize()
    console.info(`[sheets:${requestId}] authorized JWT service account=${serviceAccount.client_email}`);

    const sheets = google.sheets({ version: 'v4', auth: jwtClient })

    // Get metadata to find the sheet name (use first sheet or named "BASE")
    const meta = await sheets.spreadsheets.get({ spreadsheetId, fields: 'sheets.properties.title' })
    const sheetsList = meta.data.sheets || []
    const sheet = sheetsList.find(s => (s.properties?.title || '').toUpperCase().includes('BASE')) || sheetsList[0]
    if (!sheet) {
      console.error(`[sheets:${requestId}] no sheets in spreadsheet ${spreadsheetId}`);
      res.status(500).json({ error: 'No sheets found in spreadsheet.' })
      return
    }

    const sheetName = sheet.properties.title
    console.info(`[sheets:${requestId}] using sheet: ${sheetName}`);

    const valuesResp = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:AZ`,
    })

    const vals = valuesResp.data.values || []
    console.info(`[sheets:${requestId}] fetched rows=${vals.length}`);
    if (vals.length < 2) {
      res.setHeader('x-sheets-rows', '0');
      res.status(200).json({ rows: [], total: 0 })
      return
    }

    const headers = vals[0].map(h => String(h || '').trim())
    const rows = vals.slice(1).map(r => {
      const obj = {}
      headers.forEach((h, i) => { obj[h] = r[i] || '' })
      return obj
    })

    res.setHeader('x-sheets-rows', String(rows.length));
    res.setHeader('x-sheets-request-id', requestId);
    console.info(`[sheets:${requestId}] returning rows=${rows.length} in ${Date.now()-start}ms`);
    res.status(200).json({ rows, total: rows.length })
  } catch (err) {
    console.error(`[sheets:${requestId}] sheets function error:`, err)
    res.status(500).json({ error: String(err.message || err) })
  }
}
