import {
  buildDetail,
  CLASS_LABELS,
  classifyRawStatus,
  isTerminalClass,
  needsContact,
  normalizeText,
  resolveClass,
} from "./status.js";
import {
  appendHeaders,
  batchWriteCells,
  createSheetsClient,
  readGrid,
  resolveColumns,
  resolveSheet,
} from "./sheets.js";
import {
  applyStatusToAgendamentos,
  createSupabase,
  fetchAgendamentosByProtocolos,
  fetchTechnicianNames,
} from "./supabaseClient.js";

export async function syncOnce({ config, sheets, supabase }) {
  const startedAt = Date.now();
  const startedAtIso = new Date().toISOString();

  const sheet = await resolveSheet(sheets, config.spreadsheetId, config.sheetTitle);
  const grid = await readGrid(sheets, config.spreadsheetId, sheet.title);
  const headerRowNumber = Number.isFinite(config.headerRow) && config.headerRow >= 1 ? config.headerRow : 1;
  const { columns, osIndex, statusIndex, added } = resolveColumns(grid, config);

  if (osIndex === -1) {
    throw new Error("Coluna de Ordem de Serviço (OS) não encontrada na planilha.");
  }
  if (statusIndex === -1) {
    throw new Error("Coluna de status não encontrada na planilha.");
  }

  if (added.length) {
    await appendHeaders(sheets, config.spreadsheetId, sheet.sheetId, sheet.title, added, headerRowNumber, sheet.columnCount);
  }

  const byKey = new Map(columns.map((column) => [column.key, column]));
  const statusColumn = byKey.get("statusSincronizado");
  const contactColumn = byKey.get("precisaContato");
  const detailColumn = byKey.get("detalheStatus");
  const syncColumn = byKey.get("ultimaSincronizacao");

  const dataRows = grid.slice(headerRowNumber);
  const rowMeta = dataRows.map((row, index) => ({
    sheetRow: index + headerRowNumber + 1,
    os: String(row[osIndex] ?? "").trim(),
    rawStatus: String(row[statusIndex] ?? "").trim(),
    row,
  }));

  const protocolos = rowMeta.filter((meta) => meta.os).map((meta) => meta.os);
  const agendamentos = await fetchAgendamentosByProtocolos(supabase, protocolos);
  const technicianNames = await fetchTechnicianNames(supabase);

  const writes = [];
  const agendamentoUpdates = [];
  let semOS = 0;

  for (const meta of rowMeta) {
    if (!meta.os) {
      semOS += 1;
      continue;
    }

    const agendamento = agendamentos.get(meta.os);
    const rawClass = classifyRawStatus(meta.rawStatus);
    const klass = resolveClass(rawClass, agendamento);
    const contactLabel = needsContact(klass) ? "SIM" : "NÃO";
    const detail = buildDetail(klass, agendamento, technicianNames);
    const label = CLASS_LABELS[klass] || klass;

    const existingStatus = normalizeText(meta.row[statusColumn.index]);
    const existingContact = normalizeText(meta.row[contactColumn.index]);
    const existingDetail = normalizeText(meta.row[detailColumn.index]);

    const changed =
      existingStatus !== normalizeText(label) ||
      existingContact !== normalizeText(contactLabel) ||
      existingDetail !== normalizeText(detail);

    if (changed) {
      writes.push({ rowIndex: meta.sheetRow, columnIndex: statusColumn.index, value: label });
      writes.push({ rowIndex: meta.sheetRow, columnIndex: contactColumn.index, value: contactLabel });
      writes.push({ rowIndex: meta.sheetRow, columnIndex: detailColumn.index, value: detail });
      writes.push({ rowIndex: meta.sheetRow, columnIndex: syncColumn.index, value: startedAtIso });
    }

    if (config.syncBackToAgendamentos && agendamento && isTerminalClass(klass)) {
      const targetStatus = klass === "cancelada" ? "cancelado" : "finalizado";
      if (normalizeText(agendamento.status) !== targetStatus) {
        agendamentoUpdates.push({ id: agendamento.id, status: targetStatus });
      }
    }
  }

  const cellsWritten = writes.length
    ? await batchWriteCells(sheets, config.spreadsheetId, sheet.title, writes)
    : 0;

  const agendamentosUpdated = agendamentoUpdates.length
    ? await applyStatusToAgendamentos(supabase, agendamentoUpdates)
    : 0;

  const changedRows = new Set(writes.map((write) => write.rowIndex)).size;

  return {
    timestamp: startedAtIso,
    aba: sheet.title,
    totalLinhas: dataRows.length,
    ordensProcessadas: rowMeta.length - semOS,
    semOS,
    linhasAlteradas: changedRows,
    celulasEscritas: cellsWritten,
    agendamentosAtualizados: agendamentosUpdated,
    duracaoMs: Date.now() - startedAt,
  };
}

export async function runSync(config) {
  const sheets = createSheetsClient(config);
  const supabase = createSupabase(config);
  return syncOnce({ config, sheets, supabase });
}
