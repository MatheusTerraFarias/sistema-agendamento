import express from "express";
import cors from "cors";
import https from "https";
import http from "http";
import crypto from "crypto";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID || "1S7gJzRixU2IlroN4nbIMXsq671QQUDb400y8hR8qC1s";

let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(join(__dirname, "public", "service-account.json"), "utf-8"));
  console.log("Service account:", serviceAccount.client_email);
} catch (e) {
  console.error("Service account não encontrada:", e.message);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const mod = urlObj.protocol === "https:" ? https : http;

    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === "https:" ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || "GET",
      headers: options.headers || {},
      timeout: 15000,
    };

    const req = mod.request(reqOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: { raw: data.substring(0, 500) } });
        }
      });
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Timeout ao conectar com " + urlObj.hostname));
    });

    req.on("error", (e) => {
      reject(new Error("Erro de conexão com " + urlObj.hostname + ": " + e.message));
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const headerB64 = Buffer.from(JSON.stringify(header)).toString("base64url");
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");

  const sign = crypto.createSign("RSA-SHA256");
  sign.update(headerB64 + "." + payloadB64);
  const signature = sign.sign(serviceAccount.private_key, "base64url");

  const jwt = headerB64 + "." + payloadB64 + "." + signature;

  console.log("Buscando token de acesso...");

  const result = await makeRequest("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=" + jwt,
  });

  if (result.data.error) {
    console.error("Erro token:", result.data);
    throw new Error(result.data.error_description || result.data.error);
  }

  console.log("Token obtido com sucesso");
  return result.data.access_token;
}

function mapStatus(s) {
  s = (s || "").toLowerCase().trim();
  if (s.includes("conclu")) return "finalizado";
  if (s.includes("inici")) return "em_andamento";
  if (s.includes("pendente")) return "novo";
  if (s.includes("cancel")) return "cancelado";
  if (s.includes("não conclu") || s.includes("nao conclu")) return "em_andamento";
  return "novo";
}

function parseSheetDate(raw) {
  if (!raw) return null;
  const parts = raw.split("/");
  if (parts.length === 3) return parts[2] + "-" + parts[1].padStart(2, "0") + "-" + parts[0].padStart(2, "0");
  return raw;
}

function extractBairro(addr) {
  if (!addr) return "";
  const parts = addr.split(",");
  return parts.length > 1 ? parts[1].trim() : addr.trim();
}

app.get("/api/sheets", async (req, res) => {
  try {
    if (!serviceAccount) {
      throw new Error("Service account não encontrada em public/service-account.json");
    }

    // Teste de conectividade
    console.log("Testando conexão com Google...");
    try {
      const test = await makeRequest("https://www.google.com");
      console.log("Conexão OK, status:", test.status);
    } catch (e) {
      console.error("Falha na conexão:", e.message);
      throw new Error("Não foi possível conectar ao Google. Verifique sua conexão com a internet. Erro: " + e.message);
    }

    const accessToken = await getAccessToken();

    const metaUrl = "https://sheets.googleapis.com/v4/spreadsheets/" + SPREADSHEET_ID + "?fields=sheets.properties.title";
    const meta = await makeRequest(metaUrl, { headers: { Authorization: "Bearer " + accessToken } });
    if (meta.data.error) throw new Error(meta.data.error.message);

    const sheetName = meta.data.sheets?.[0]?.properties?.title;
    if (!sheetName) throw new Error("Nenhuma aba encontrada");

    console.log("Lendo aba:", sheetName);

    const range = sheetName + "!A:V";
    const dataUrl = "https://sheets.googleapis.com/v4/spreadsheets/" + SPREADSHEET_ID + "/values/" + encodeURIComponent(range);
    const data = await makeRequest(dataUrl, { headers: { Authorization: "Bearer " + accessToken } });
    if (data.data.error) throw new Error(data.data.error.message);

    const values = data.data.values || [];
    if (values.length < 2) {
      return res.json({ rows: [], total: 0 });
    }

    const headers = values[0].map((h) => h.trim().toLowerCase());
    const rows = values.slice(1).map((row) => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i] || ""; });
      return {
        protocolo: obj["chamado"] || obj["nº chamado"] || "",
        cliente_nome: obj["nome"] || "",
        telefone: obj["telefone"] || obj["tel"] || "",
        status: mapStatus(obj["status da atividade"] || ""),
        data_agendamento: parseSheetDate(obj["data"] || ""),
        bairro: extractBairro(obj["endereço"] || obj["endereco"] || ""),
        atendente_nome: obj["recurso"] || "",
        servico_nome: obj["intervalo"] || "",
        hora_agendamento: obj["início"] || obj["inicio"] || "",
      };
    });

    console.log("Retornando " + rows.length + " registros");
    res.json({ rows, total: rows.length });
  } catch (err) {
    console.error("Erro:", err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("Sheets proxy rodando em http://localhost:" + PORT);
});
