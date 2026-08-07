const fs = require('fs');
const crypto = require('crypto');

const sa = JSON.parse(fs.readFileSync('public/service-account.json', 'utf-8'));

function createJWT() {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(headerB64 + '.' + payloadB64);
  const signature = sign.sign(sa.private_key, 'base64url');

  return headerB64 + '.' + payloadB64 + '.' + signature;
}

async function main() {
  const jwt = createJWT();

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=' + jwt,
  });
  const tokenData = await tokenRes.json();
  if (tokenData.error) { console.error('Token error:', tokenData); process.exit(1); }

  const spreadsheetId = '1S7gJzRixU2IlroN4nbIMXsq671QQUDb400y8hR8qC1s';

  // Get spreadsheet metadata (sheet names)
  const metaRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets/' + spreadsheetId + '?fields=sheets.properties.title', {
    headers: { Authorization: 'Bearer ' + tokenData.access_token },
  });
  const meta = await metaRes.json();
  console.log('Sheet names:', JSON.stringify(meta.sheets?.map(s => s.properties.title)));

  // Try reading first sheet
  const firstSheet = meta.sheets?.[0]?.properties?.title;
  if (firstSheet) {
    const range = firstSheet + '!A1:V3';
    console.log('Trying range:', range);
    const dataRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets/' + spreadsheetId + '/values/' + encodeURIComponent(range), {
      headers: { Authorization: 'Bearer ' + tokenData.access_token },
    });
    const data = await dataRes.json();
    if (data.values) {
      console.log('Headers:', data.values[0]?.join(' | '));
      console.log('Row 1:', data.values[1]?.join(' | '));
    } else {
      console.log('Data:', JSON.stringify(data));
    }
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
