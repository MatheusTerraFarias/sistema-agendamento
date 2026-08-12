import { google } from "googleapis";

const SPREADSHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID || "1S7gJzRixU2lIroN4nblMXsq671QQUDb4";
const SHEET_NAME = "BASE";

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

function normalizeField(s) {
  return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function findCol(row, terms) {
  for (const [k, v] of Object.entries(row)) {
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

export function mapSheetToAgendamentos(rows) {
  return rows.map((row) => ({
    protocolo: cleanProtocolo(findCol(row, ["ordem de servico", "ordem de serviço", "chamado", "nº chamado", "numero da os", "numero_da_os", "protocolo"])),
    cliente_nome: findCol(row, ["nome"]),
    telefone: findCol(row, ["telefone celular", "telefone", "tel"]),
    status: mapStatus(findCol(row, ["status da atividade"]) || findCol(row, ["status"])),
    data_agendamento: parseSheetDate(findCol(row, ["data"])),
    bairro: findCol(row, ["bairro"]),
    area: findCol(row, ["territorio sp", "territorio", "area"]) || null,
    atendente_nome: findCol(row, ["recurso"]),
    servico_nome: findCol(row, ["intervalo"]),
    hora_agendamento: findCol(row, ["inicio"]),
  }));
}

function mapStatus(sheetStatus) {
  const s = normalizeField(sheetStatus);
  if (s.includes("nao conclu")) return "nao_concluido";
  if (s.includes("conclu")) return "finalizado";
  if (s.includes("inici")) return "em_andamento";
  if (s.includes("pendente")) return "novo";
  if (s.includes("cancel")) return "cancelado";
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
