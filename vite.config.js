import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import https from 'https'
import crypto from 'crypto'
import { existsSync, readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

const envPath = dotenv.config({ path: join(process.cwd(), '.env.local') }).parsed ? join(process.cwd(), '.env.local') : join(process.cwd(), '.env')
if (!dotenv.config({ path: envPath }).parsed) {
  console.warn('[vite] No .env.local or .env file loaded.');
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID || ''
const SERVICE_ACCOUNT_FILE = process.env.GOOGLE_SERVICE_ACCOUNT_FILE || (existsSync(join(__dirname, 'projeto-prazos-496410-6c1930ca2d99.json')) ? join(__dirname, 'projeto-prazos-496410-6c1930ca2d99.json') : join(__dirname, 'public', 'service-account.json'))

let serviceAccount = null
let serviceAccountLoaded = false
try {
  serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_FILE, 'utf-8'))
  serviceAccountLoaded = Boolean(serviceAccount?.client_email && serviceAccount?.private_key)
  if (serviceAccountLoaded) {
    console.log('[sheets] Service account:', serviceAccount.client_email)
  } else {
    console.warn('[sheets] Service account encontrada, mas o JSON nao contem client_email/private_key.')
  }
} catch (e) {
  console.warn('[sheets] Service account nao encontrada em', SERVICE_ACCOUNT_FILE, ':', e.message)
}

function httpsPost(url, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url)
    const req = https.request({
      hostname: u.hostname, port: 443, path: u.pathname, method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) },
      timeout: 15000,
    }, (res) => {
      let d = ''; res.on('data', (c) => d += c)
      res.on('end', () => { try { resolve(JSON.parse(d)) } catch(e) { reject(new Error(d.substring(0,200))) } })
    })
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')) })
    req.on('error', reject)
    req.write(body); req.end()
  })
}

function httpsGet(url, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url)
    const req = https.request({
      hostname: u.hostname, port: 443, path: u.pathname + u.search, method: 'GET',
      headers: { Authorization: 'Bearer ' + token }, timeout: 15000,
    }, (res) => {
      let d = ''; res.on('data', (c) => d += c)
      res.on('end', () => { try { resolve(JSON.parse(d)) } catch(e) { reject(new Error(d.substring(0,200))) } })
    })
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')) })
    req.on('error', reject)
    req.end()
  })
}

async function getToken() {
  const now = Math.floor(Date.now() / 1000)
  const h = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const p = Buffer.from(JSON.stringify({
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600,
  })).toString('base64url')
  const sign = crypto.createSign('RSA-SHA256')
  sign.update(h + '.' + p)
  const sig = sign.sign(serviceAccount.private_key, 'base64url')
  const r = await httpsPost('https://oauth2.googleapis.com/token', 'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=' + h + '.' + p + '.' + sig)
  if (r.error) throw new Error(r.error_description || r.error.error_description || JSON.stringify(r))
  return r.access_token
}

function findCol(headers, ...candidates) {
  const norm = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
  for (const c of candidates) {
    const idx = headers.findIndex(h => norm(h) === norm(c))
    if (idx >= 0) return idx
  }
  for (const c of candidates) {
    const idx = headers.findIndex(h => norm(h).includes(norm(c)))
    if (idx >= 0) return idx
  }
  return -1
}

async function handleSheetsRequest(req, res) {
  try {
    if (!serviceAccount) throw new Error('Service account nao encontrada')
    const token = await getToken()
    const meta = await httpsGet('https://sheets.googleapis.com/v4/spreadsheets/' + SPREADSHEET_ID + '?fields=sheets.properties.title', token)
    if (meta.error) throw new Error(meta.error.message)
    const tab = (meta.sheets || []).find(s => s.properties?.title?.includes('BASE')) || meta.sheets?.[0]
    const name = tab?.properties?.title
    if (!name) throw new Error('Nenhuma aba')
    console.log('[sheets] Lendo aba:', name)

    const data = await httpsGet('https://sheets.googleapis.com/v4/spreadsheets/' + SPREADSHEET_ID + '/values/' + encodeURIComponent(name + '!A:AZ'), token)
    if (data.error) throw new Error(data.error.message)
    const vals = data.values || []
    if (vals.length < 2) { res.end(JSON.stringify({ rows: [], total: 0 })); return }

    const rawHeaders = vals[0]
    console.log('[sheets] Colunas originais:', rawHeaders.join(' | '))

    const hdrs = rawHeaders.map(h => String(h || '').trim().toLowerCase())
    console.log('[sheets] Colunas normalizadas:', hdrs.join(' | '))

    const idx = {
      // A OS fica na coluna Y (indice 24): Ordem de Servico
      protocolo: (() => {
        if (hdrs[24] && hdrs[24].includes('ordem')) return 24
        const byName = findCol(hdrs, 'ordem de servico', 'n chamado', 'numero chamado')
        return byName >= 0 ? byName : 24
      })(),
      cliente: findCol(hdrs, 'nome', 'cliente', ' nome'),
      telefone: findCol(hdrs, 'telefone', 'tel', 'phone'),
      status: findCol(hdrs, 'status da atividade', 'status'),
      data: findCol(hdrs, 'data', 'date'),
      endereco: findCol(hdrs, 'endereco', 'rua'),
      bairro: findCol(hdrs, 'bairro'),
      hora: findCol(hdrs, 'inicio'),
      territorio: findCol(hdrs, 'territorio sp', 'territorio', 'território sp', 'territorio', 'area'),
    }
    console.log('[sheets] Indices mapeados:', JSON.stringify(idx))

    const rows = vals.slice(1).map(r => {
      const get = (i) => i >= 0 && i < r.length ? (r[i] || '').trim() : ''

      const st = get(idx.status).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
      let status = 'novo'
      if (st.includes('confirmado')) status = 'confirmado'
      else if (st.includes('conclu')) status = 'concluido'
      else if (st.includes('normalizado')) status = 'normalizado'
      else if (st.includes('mensagem')) status = 'mensagem'
      else if (st.includes('sem contato')) status = 'sem_contato'
      else if (st.includes('tratar')) status = 'tratar_os'
      else if (st.includes('outra area')) status = 'outra_area'
      else if (st.includes('cancel')) status = 'cancelado'
      else if (st.includes('nao conclu') || st.includes('não conclu')) status = 'nao_concluido'
      else if (st.includes('outros')) status = 'outros'

      const dt = get(idx.data)
      let dataAg = null
      const m = dt.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/)
      if (m) dataAg = m[3]+'-'+m[2].padStart(2,'0')+'-'+m[1].padStart(2,'0')
      else dataAg = dt || null

      const hr = get(idx.hora)
      const horaMatch = hr.match(/^(\d{1,2}):(\d{2})/)
      const horaAgendamento = horaMatch ? horaMatch[1].padStart(2, '0') + ':' + horaMatch[2] : hr || null

      const end = get(idx.endereco)
      let bairro = get(idx.bairro)
      if (!bairro && end) {
        const parts = end.split(',')
        bairro = parts.length > 1 ? parts[1].trim() : ''
      }

      return {
        protocolo: get(idx.protocolo),
        cliente_nome: get(idx.cliente),
        telefone: get(idx.telefone),
        status, data_agendamento: dataAg || null, hora_agendamento: horaAgendamento, bairro, area: get(idx.territorio) || null,
      }
    })
    .filter(r => r.protocolo)

    console.log('[sheets]', rows.length, 'registros (apos filtrar vazios)')
    res.end(JSON.stringify({ rows, total: rows.length }))
  } catch (e) {
    console.error('[sheets] Erro:', e.message)
    res.statusCode = 500
    res.end(JSON.stringify({ error: e.message }))
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'google-sheets-proxy',
      configureServer(server) {
        server.middlewares.use('/api/sheets', async (req, res) => {
          res.setHeader('Content-Type', 'application/json')
          if (!SPREADSHEET_ID) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: 'Missing GOOGLE_SHEET_ID environment variable.' }))
            return
          }
          if (!serviceAccountLoaded) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: `Google service account not loaded from ${SERVICE_ACCOUNT_FILE}.` }))
            return
          }
          await handleSheetsRequest(req, res)
        })
      },
    },
  ],
})
