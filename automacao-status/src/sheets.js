import { readFileSync } from "node:fs";
import { google } from "googleapis";
import { findColumn, normalizeHeader } from "./config.js";

export function createSheetsClient(config) {
  const scopes = ["https://www.googleapis.com/auth/spreadsheets"];
  let auth;

  if (config.googleApplicationCredentials) {
    const raw = readFileSync(config.googleApplicationCredentials, "utf8");
    const credentials = JSON.parse(raw);
    auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes,
    });
  } else {
    auth = new google.auth.JWT({
      email: config.googleServiceAccountEmail,
      key: config.googlePrivateKey,
      scopes,
    });
  }

  return google.sheets({ version: "v4", auth });
}

export function columnToLetter(column) {
  let letter = "";
  let n = column;
  while (n > 0) {
    const mod = (n - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    n = Math.floor((n - 1) / 26);
  }
  return letter;
}

function quoteSheetTitle(title) {
  return `'${title.replace(/'/g, "''")}'`;
}

export async function resolveSheet(sheets, spreadsheetId, preferredTitle) {
  const response = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties(sheetId,title,gridProperties)",
  });
  const sheetList = response.data.sheets || [];
  if (!sheetList.length) throw new Error("A planilha não possui abas.");

  let target = null;
  if (preferredTitle) {
    target =
      sheetList.find((sheet) => sheet.properties.title === preferredTitle) ||
      sheetList.find((sheet) =>
        sheet.properties.title.toLowerCase().includes(preferredTitle.toLowerCase())
      );
  }
  target = target || sheetList[0];
  return {
    sheetId: target.properties.sheetId,
    title: target.properties.title,
    columnCount: target.properties.gridProperties?.columnCount || 26,
    rowCount: target.properties.gridProperties?.rowCount || 1000,
  };
}

export async function readGrid(sheets, spreadsheetId, sheetTitle) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${quoteSheetTitle(sheetTitle)}!A1:ZZ`,
    valueRenderOption: "FORMATTED_VALUE",
  });
  return response.data.values || [];
}

// Mapeia colunas de origem/saída. Colunas de saída ausentes são adicionadas
// no final do cabeçalho.
export function resolveColumns(grid, config) {
  const headerRowNumber = Number.isFinite(config.headerRow) && config.headerRow >= 1 ? config.headerRow : 1;
  const originalHeaderRow = (grid[headerRowNumber - 1] || []).slice();
  const headerRow = originalHeaderRow.slice();
  const columns = [];
  let nextIndex = headerRow.length;

  for (const output of config.outputColumns) {
    const existing = headerRow.findIndex(
      (header) => normalizeHeader(header) === normalizeHeader(output.label)
    );
    if (existing !== -1) {
      columns.push({ ...output, index: existing });
    } else {
      columns.push({ ...output, index: nextIndex });
      headerRow[nextIndex] = output.label;
      nextIndex += 1;
    }
  }

  const resolveRef = (ref) => {
    if (!ref) return -1;
    if (ref.type === "letter") return ref.index;
    return headerRow.findIndex((header) => normalizeHeader(header) === normalizeHeader(ref.name));
  };

  let osIndex = resolveRef(config.osColumnRef);
  if (osIndex === -1) osIndex = findColumn(headerRow, config.osAliases);

  let statusIndex = resolveRef(config.statusColumnRef);
  if (statusIndex === -1) statusIndex = findColumn(headerRow, config.statusAliases);

  const added = columns
    .filter((column) => column.index >= originalHeaderRow.length)
    .map((column) => ({ label: column.label, index: column.index }));

  return { headerRow, columns, osIndex, statusIndex, added };
}

export async function appendHeaders(sheets, spreadsheetId, sheetId, sheetTitle, added, headerRowNumber = 1, currentColumnCount = 26) {
  if (!added.length) return;
  const first = added[0].index + 1;
  const last = added[added.length - 1].index + 1;
  const headerRowNumberSafe = Number.isFinite(headerRowNumber) && headerRowNumber >= 1 ? headerRowNumber : 1;
  const neededColumns = last;

  if (neededColumns > currentColumnCount) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            updateSheetProperties: {
              properties: { sheetId, gridProperties: { columnCount: neededColumns } },
              fields: "gridProperties.columnCount",
            },
          },
        ],
      },
    });
  }

  const range = `${quoteSheetTitle(sheetTitle)}!${columnToLetter(first)}${headerRowNumberSafe}:${columnToLetter(last)}${headerRowNumberSafe}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [added.map((column) => column.label)] },
  });
}

function buildRuns(items) {
  const sorted = [...items].sort((a, b) => a.rowIndex - b.rowIndex);
  const runs = [];
  let current = [];
  for (const item of sorted) {
    const last = current[current.length - 1];
    if (last && item.rowIndex !== last.rowIndex + 1) {
      runs.push(current);
      current = [];
    }
    current.push(item);
  }
  if (current.length) runs.push(current);
  return runs;
}

// Escreve apenas as células que mudaram, agrupadas em intervalos contíguos.
export async function batchWriteCells(sheets, spreadsheetId, sheetTitle, writes) {
  if (!writes.length) return 0;

  const byColumn = new Map();
  for (const write of writes) {
    if (!byColumn.has(write.columnIndex)) byColumn.set(write.columnIndex, []);
    byColumn.get(write.columnIndex).push(write);
  }

  const valueRanges = [];
  for (const [columnIndex, columnWrites] of byColumn) {
    const letter = columnToLetter(columnIndex + 1);
    for (const run of buildRuns(columnWrites)) {
      const startRow = run[0].rowIndex;
      const endRow = run[run.length - 1].rowIndex;
      valueRanges.push({
        range: `${quoteSheetTitle(sheetTitle)}!${letter}${startRow}:${letter}${endRow}`,
        values: run.map((write) => [write.value]),
      });
    }
  }

  for (let i = 0; i < valueRanges.length; i += 100) {
    const chunk = valueRanges.slice(i, i + 100);
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: { valueInputOption: "USER_ENTERED", data: chunk },
    });
  }

  return writes.length;
}
