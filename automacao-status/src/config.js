import "dotenv/config";

const OS_COLUMN_ALIASES = [
  "ordem de servico",
  "ordemdeservico",
  "numero da os",
  "numero da ordem de servico",
  "numero_os",
  "numeroos",
  "protocolo",
  "id da ordem de servico",
  "codigo",
  "os",
];

const STATUS_COLUMN_ALIASES = [
  "status da atividade",
  "status da os",
  "status da ordem de servico",
  "situacao da atividade",
  "situacao do atendimento",
  "situacao",
  "status",
];

export const DEFAULT_OUTPUT_COLUMNS = Object.freeze([
  { key: "statusSincronizado", label: "STATUS SINCRONIZADO" },
  { key: "precisaContato", label: "PRECISA CONTATO" },
  { key: "detalheStatus", label: "DETALHE STATUS" },
  { key: "ultimaSincronizacao", label: "ULTIMA SINCRONIZACAO" },
]);


export function columnLetterToIndex(value) {
  const match = String(value ?? "").trim().match(/^[A-Za-z]{1,3}$/);
  if (!match) return null;
  let index = 0;
  for (const ch of match[0].toUpperCase()) {
    index = index * 26 + (ch.charCodeAt(0) - 64);
  }
  return index - 1;
}

// Refer?ncia de coluna configurada: pode ser letra ("Y") ou nome de cabe?alho.
export function resolveColumnRef(rawValue) {
  const trimmed = String(rawValue ?? "").trim();
  if (!trimmed) return null;
  const letterIndex = columnLetterToIndex(trimmed);
  if (letterIndex !== null) return { type: "letter", index: letterIndex, raw: trimmed };
  return { type: "name", name: trimmed, raw: trimmed };
}

export function normalizeHeader(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Encontra uma coluna no cabeçalho por ordem de prioridade dos aliases.
export function findColumn(headers, aliases) {
  const normalized = headers.map(normalizeHeader);
  for (const alias of aliases) {
    const aliasNorm = normalizeHeader(alias);
    const exact = normalized.findIndex((header) => header === aliasNorm);
    if (exact !== -1) return exact;
  }
  for (const alias of aliases) {
    const aliasNorm = normalizeHeader(alias);
    if (aliasNorm.length < 5) continue;
    const partial = normalized.findIndex(
      (header) => header && (header.includes(aliasNorm) || aliasNorm.includes(header))
    );
    if (partial !== -1) return partial;
  }
  return -1;
}

export function loadConfig(env = process.env) {
  const required = ["SPREADSHEET_ID", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
  const missing = required.filter((key) => !env[key]?.trim());
  if (missing.length) {
    throw new Error(`Variáveis de ambiente ausentes: ${missing.join(", ")}. Copie .env.example para .env e preencha.`);
  }

  if (!env.GOOGLE_SERVICE_ACCOUNT_EMAIL && !env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error(
      "Credenciais do Google ausentes: informe GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY ou GOOGLE_APPLICATION_CREDENTIALS."
    );
  }

  const syncIntervalSeconds = Number(env.SYNC_INTERVAL_SECONDS || 60);
  const debounceMs = Number(env.DEBOUNCE_MS || 5000);
  const maxBackoffMs = Number(env.MAX_BACKOFF_MS || 300000);

  return {
    spreadsheetId: env.SPREADSHEET_ID.trim(),
    sheetTitle: env.SHEET_NAME?.trim() || null,
    osColumn: env.OS_COLUMN?.trim() || null,
    statusColumn: env.STATUS_COLUMN?.trim() || null,
    osColumnRef: resolveColumnRef(env.OS_COLUMN),
    statusColumnRef: resolveColumnRef(env.STATUS_COLUMN),
    headerRow: Number(env.HEADER_ROW || 1),
    osAliases: OS_COLUMN_ALIASES,
    statusAliases: STATUS_COLUMN_ALIASES,
    outputColumns: DEFAULT_OUTPUT_COLUMNS.map((column) => ({
      ...column,
      label: env[`OUTPUT_${column.key.toUpperCase()}_COLUMN`]?.trim() || column.label,
    })),
    supabaseUrl: env.SUPABASE_URL.trim(),
    supabaseServiceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY.trim(),
    googleServiceAccountEmail: env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim(),
    googlePrivateKey: (env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    googleApplicationCredentials: env.GOOGLE_APPLICATION_CREDENTIALS?.trim(),
    syncBackToAgendamentos: env.SYNC_BACK_TO_AGENDAMENTOS !== "false",
    syncIntervalMs:
      Number.isFinite(syncIntervalSeconds) && syncIntervalSeconds > 0 ? syncIntervalSeconds * 1000 : 60000,
    debounceMs: Number.isFinite(debounceMs) && debounceMs > 0 ? debounceMs : 5000,
    maxBackoffMs: Number.isFinite(maxBackoffMs) && maxBackoffMs > 0 ? maxBackoffMs : 300000,
  };
}
