import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SERVICE_ACCOUNT = JSON.parse(Deno.env.get("GOOGLE_SERVICE_ACCOUNT") || "{}");

function pemToDer(pem) {
  const b64 = pem.replace(/-----BEGIN PRIVATE KEY-----/, "").replace(/-----END PRIVATE KEY-----/, "").replace(/\s/g, "");
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: SERVICE_ACCOUNT.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const key = await crypto.subtle.importKey("pkcs8", pemToDer(SERVICE_ACCOUNT.private_key), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(`${headerB64}.${payloadB64}`));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const jwt = `${headerB64}.${payloadB64}.${sigB64}`;
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const tokenData = await tokenResponse.json();
  if (tokenData.error) throw new Error(tokenData.error_description || tokenData.error);
  return tokenData.access_token;
}

function parseSheetDate(raw) {
  if (!raw) return null;
  const parts = raw.split("/");
  if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
  return raw;
}

function extractBairro(addr) {
  if (!addr) return "";
  const parts = addr.split(",");
  return parts.length > 1 ? parts[1].trim() : addr.trim();
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const spreadsheetId = Deno.env.get("GOOGLE_SHEET_ID") || "1S7gJzRixU2IlroN4nbIMXsq671QQUDb400y8hR8qC1s";

    if (!SERVICE_ACCOUNT.client_email) {
      throw new Error("GOOGLE_SERVICE_ACCOUNT não configurada.");
    }

    const accessToken = await getAccessToken();

    // Buscar metadados para pegar o sheetId (não o nome com emoji)
    const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const meta = await metaRes.json();
    if (meta.error) throw new Error(meta.error.message);

    const firstSheet = meta.sheets?.[0]?.properties;
    if (!firstSheet) throw new Error("Nenhuma aba encontrada");

    const sheetId = firstSheet.sheetId;

    // Usar sheetId ao invés do nome
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetId}!A:V`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const values = data.values || [];
    if (values.length < 2) {
      return new Response(JSON.stringify({ rows: [], total: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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

    return new Response(JSON.stringify({ rows, total: rows.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
