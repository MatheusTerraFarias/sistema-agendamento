import { google } from "googleapis";

const SPREADSHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID || "1S7gJzRixU2lIroN4nblMXsq671QQUDb4";
const SHEET_NAME = "BASE";

// Para uso com API key (planilha pública compartilhada)
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || "";

export async function fetchSheetData() {
  if (!API_KEY) {
    console.warn("VITE_GOOGLE_API_KEY não configurada. Usando modo offline.");
    return null;
  }

  try {
    const sheets = google.sheets({ version: "v4", auth: API_KEY });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:V`,
    });

    const rows = response.data.values || [];
    if (rows.length < 2) return [];

    const headers = rows[0].map((h) => h.trim().toLowerCase());
    return rows.slice(1).map((row) => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = row[i] || "";
      });
      return obj;
    });
  } catch (err) {
    console.error("Erro ao buscar planilha:", err);
    throw err;
  }
}

// Mapear colunas da planilha para o modelo do app
export function mapSheetToAgendamentos(rows) {
  return rows.map((row) => ({
    protocolo: row["chamado"] || row["nº chamado"] || "",
    cliente_nome: row["nome"] || "",
    telefone: row["telefone"] || row["tel"] || "",
    status: mapStatus(row["status da atividade"] || ""),
    data_agendamento: parseSheetDate(row["data"] || ""),
    bairro: extractBairro(row["endereço"] || row["endereco"] || ""),
    atendente_nome: row["recurso"] || "",
    servico_nome: row["intervalo"] || "",
    hora_agendamento: row["início"] || row["inicio"] || "",
  }));
}

function mapStatus(sheetStatus) {
  const s = (sheetStatus || "").toLowerCase().trim();
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
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
  }
  return raw;
}

function extractBairro(address) {
  if (!address) return "";
  const parts = address.split(",");
  return parts.length > 1 ? parts[1].trim() : address.trim();
}
