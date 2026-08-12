import http from "http";
import https from "https";
import crypto from "crypto";
import { existsSync, readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from 'dotenv';

const envFile = existsSync(join(process.cwd(), '.env.local')) ? '.env.local' : '.env';
dotenv.config({ path: join(process.cwd(), envFile) });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID || "1S7gRixU2IlroN4nbIMXsq671QQUDb4hR8qC1s";
const SERVICE_ACCOUNT_FILE = process.env.GOOGLE_SERVICE_ACCOUNT_FILE || (existsSync(join(__dirname, "projeto-prazos-496410-6c1930ca2d99.json")) ? join(__dirname, "projeto-prazos-496410-6c1930ca2d99.json") : join(__dirname, "public", "service-account.json"));

let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_FILE, "utf-8"));
} catch (err) {
  console.error(`Failed to read Google service account file: ${SERVICE_ACCOUNT_FILE}`);
  console.error(err.message);
  process.exit(1);
}

if (!SPREADSHEET_ID) {
  console.error('Missing GOOGLE_SHEET_ID environment variable.');
  process.exit(1);
}

function httpsPost(url, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname, port: 443, path: u.pathname, method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "Content-Length": Buffer.byteLength(body) },
      timeout: 15000,
    }, (res) => {
      let d = ""; res.on("data", (c) => d += c);
      res.on("end", () => { try { resolve(JSON.parse(d)); } catch(e) { reject(new Error(d.substring(0,200))); } });
    });
    req.on("timeout", () => { req.destroy(); reject(new Error("Timeout")); });
    req.on("error", reject);
    req.write(body); req.end();
  });
}

function httpsGet(url, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname, port: 443, path: u.pathname + u.search, method: "GET",
      headers: { Authorization: "Bearer " + token }, timeout: 15000,
    }, (res) => {
      let d = ""; res.on("data", (c) => d += c);
      res.on("end", () => { try { resolve(JSON.parse(d)); } catch(e) { reject(new Error(d.substring(0,200))); } });
    });
    req.on("timeout", () => { req.destroy(); reject(new Error("Timeout")); });
    req.on("error", reject);
    req.end();
  });
}

async function getToken() {
  const now = Math.floor(Date.now() / 1000);
  const h = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const p = Buffer.from(JSON.stringify({
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now, exp: now + 3600,
  })).toString("base64url");
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(h + "." + p);
  const sig = sign.sign(serviceAccount.private_key, "base64url");
  console.log("Buscando token...");
  const r = await httpsPost("https://oauth2.googleapis.com/token", "grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=" + h + "." + p + "." + sig);
  if (r.error) throw new Error(r.error_description || r.error);
  console.log("Token OK");
  return r.access_token;
}

function mapStatus(s) {
  s = (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  if (s.includes("nao conclu")) return "nao_concluido";
  if (s.includes("conclu")) return "finalizado";
  if (s.includes("inici")) return "em_andamento";
  if (s.includes("pendente")) return "novo";
  if (s.includes("cancel")) return "cancelado";
  return "novo";
}

function normalizeField(s) {
  return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function findCol(o, terms) {
  for (const [k, v] of Object.entries(o)) {
    const nk = normalizeField(k);
    for (const t of terms) {
      if (nk.includes(t)) return v;
    }
  }
  return "";
}

function cleanProtocolo(val) {
  const s = String(val || "").trim();
  const num = parseFloat(s);
  if (!isNaN(num) && s.includes(".")) return String(Math.floor(num));
  return s;
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }
  if (req.url !== "/api/sheets") { res.writeHead(404); res.end("Not found"); return; }

  try {
    const token = await getToken();
    const meta = await httpsGet("https://sheets.googleapis.com/v4/spreadsheets/" + SPREADSHEET_ID + "?fields=sheets.properties.title", token);
    if (meta.error) throw new Error(meta.error.message);
    const name = meta.sheets?.[0]?.properties?.title;
    if (!name) throw new Error("Nenhuma aba");
    console.log("Aba:", name);

    const data = await httpsGet("https://sheets.googleapis.com/v4/spreadsheets/" + SPREADSHEET_ID + "/values/" + encodeURIComponent(name + "!A:V"), token);
    if (data.error) throw new Error(data.error.message);
    const vals = data.values || [];
    if (vals.length < 2) { res.writeHead(200, {"Content-Type":"application/json"}); res.end(JSON.stringify({rows:[],total:0})); return; }

    const hdrs = vals[0].map(h => h.trim().toLowerCase());
    const rows = vals.slice(1).map(r => {
      const o = {}; hdrs.forEach((h,i) => { o[h] = r[i] || ""; });
      const status = mapStatus(findCol(o, ["status da atividade"]) || findCol(o, ["status"]));

      const protocolo = cleanProtocolo(findCol(o, ["ordem de servico", "ordem de servi�o", "chamado", "n� chamado", "numero da os", "numero_da_os", "protocolo"]));

      const dt = findCol(o, ["data"]) || "";
      let dataAg = null;
      const dp = dt.split("/");
      if (dp.length === 3) dataAg = dp[2]+"-"+dp[1].padStart(2,"0")+"-"+dp[0].padStart(2,"0");
      else dataAg = dt;

      const bairro = findCol(o, ["bairro"]);

      const area = findCol(o, ["territorio sp", "territorio", "area"]);

      const cliente = findCol(o, ["nome"]) || "";
      const telefone = findCol(o, ["telefone celular", "telefone", "tel"]) || "";
      const recurso = findCol(o, ["recurso"]) || "";
      const intervalo = findCol(o, ["intervalo"]) || "";
      const hora = findCol(o, ["inicio"]) || "";

      return {
        protocolo,
        cliente_nome: cliente,
        telefone,
        status,
        data_agendamento: dataAg || null,
        bairro,
        area: area || null,
        atendente_nome: recurso,
        servico_nome: intervalo,
        hora_agendamento: hora,
      };
    });

    console.log(rows.length + " registros");
    res.writeHead(200, {"Content-Type":"application/json"});
    res.end(JSON.stringify({ rows, total: rows.length }));
  } catch (e) {
    console.error("Erro:", e.message);
    res.writeHead(500, {"Content-Type":"application/json"});
    res.end(JSON.stringify({ error: e.message }));
  }
});

server.listen(3001, () => console.log("Proxy em http://localhost:3001"));
