import { useRef, useState } from "react";
import { read, utils } from "xlsx";
import { supabase } from "../lib/supabase";

const REQUIRED_COLUMNS = ["protocolo", "cliente_nome", "telefone", "data_agendamento"];
const HEADER_ALIASES = {
  protocolo: "protocolo",
  protocolo_numero: "protocolo",
  cliente: "cliente_nome",
  cliente_nome: "cliente_nome",
  cliente_nome_completo: "cliente_nome",
  nome_cliente: "cliente_nome",
  nome_do_cliente: "cliente_nome",
  telefone: "telefone",
  telefone_contato: "telefone",
  telefone_fixo: "telefone",
  telefone_celular: "telefone",
  celular: "telefone",
  telefone_cliente: "telefone",
  contato_cliente: "telefone",
  servico: "servico_nome",
  servico_nome: "servico_nome",
  nome_servico: "servico_nome",
  status: "status",
  situacao: "status",
  situacao_atendimento: "status",
  data_agendamento: "data_agendamento",
  data_de_agendamento: "data_agendamento",
  data_do_agendamento: "data_agendamento",
  agendamento_data: "data_agendamento",
  data: "data_agendamento",
  data_prevista: "data_agendamento",
  hora: "hora_agendamento",
  hora_agendamento: "hora_agendamento",
  hora_de_ingresso: "hora_agendamento",
  horario: "hora_agendamento",
  contato: "telefone",
  numero_os: "protocolo",
  numero_da_os: "protocolo",
  codigo_contrato: "protocolo",
};

function normalizeHeader(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function getMappedHeader(header) {
  return HEADER_ALIASES[header] || header;
}

function isValidDate(value) {
  return Boolean(parseDateValue(value));
}

function parseTime(value) {
  if (!value && value !== 0) return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const hour = String(value.getHours()).padStart(2, "0");
    const minute = String(value.getMinutes()).padStart(2, "0");
    return `${hour}:${minute}`;
  }

  if (typeof value === "number") {
    if (value >= 1) {
      const date = parseExcelDate(value);
      if (date && !Number.isNaN(date.getTime())) {
        const hour = String(date.getHours()).padStart(2, "0");
        const minute = String(date.getMinutes()).padStart(2, "0");
        return `${hour}:${minute}`;
      }
    } else {
      const totalSeconds = Math.round(value * 86400);
      const hour = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
      const minute = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
      return `${hour}:${minute}`;
    }
  }

  const normalized = String(value || "").trim();
  if (!normalized) return null;

  const match = normalized.match(/^(\d{1,2}):(\d{2})$/);
  if (match) {
    const [, hour, minute] = match;
    return `${hour.padStart(2, "0")}:${minute}`;
  }

  const date = new Date(normalized);
  if (!Number.isNaN(date.getTime())) {
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    return `${hour}:${minute}`;
  }

  return null;
}

function parseExcelDate(serial) {
  if (typeof serial !== "number") return null;
  const utcDays = Math.floor(serial - 25569);
  const utcValue = utcDays * 86400;
  const dateInfo = new Date(utcValue * 1000);
  dateInfo.setMinutes(dateInfo.getMinutes() + dateInfo.getTimezoneOffset());
  return dateInfo;
}

function parseDateValue(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "number") {
    return parseExcelDate(value);
  }

  const normalized = String(value || "").trim();
  if (!normalized) return null;

  const slashMatch = normalized.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (slashMatch) {
    const [, day, month, year] = slashMatch;
    const paddedYear = year.length === 2 ? `20${year}` : year;
    return new Date(`${paddedYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`);
  }

  const iso = new Date(normalized);
  return Number.isNaN(iso.getTime()) ? null : iso;
}

function getSheetHeaders(sheet) {
  const range = sheet["!ref"] ? utils.decode_range(sheet["!ref"]) : { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } };
  const headerRow = [];

  for (let col = range.s.c; col <= range.e.c; col += 1) {
    const cell = sheet[utils.encode_cell({ r: range.s.r, c: col })];
    headerRow.push(cell ? String(cell.v || "").trim() : "");
  }

  return { headerRow, range };
}

function findLastUsedRow(sheet, headerRow, range) {
  for (let row = range.e.r; row > range.s.r; row -= 1) {
    let hasValueInRow = false;

    for (let col = range.s.c; col <= range.e.c; col += 1) {
      const originalHeader = headerRow[col - range.s.c];
      const mappedKey = getMappedHeader(normalizeHeader(originalHeader));
      if (!mappedKey) continue;

      const cell = sheet[utils.encode_cell({ r: row, c: col })];
      const value = cell ? cell.v : "";
      if (value !== undefined && value !== null && String(value).trim() !== "") {
        hasValueInRow = true;
        break;
      }
    }

    if (hasValueInRow) {
      return row;
    }
  }

  return range.s.r;
}

function getSheetRows(sheet, headerRow, range) {
  const headerMap = headerRow.reduce((acc, header) => {
    acc[header] = getMappedHeader(normalizeHeader(header));
    return acc;
  }, {});

  const parsedRows = [];
  const lastUsedRow = findLastUsedRow(sheet, headerRow, range);

  for (let row = range.s.r + 1; row <= lastUsedRow; row += 1) {
    const parsed = { _rowNumber: row + 1 };
    let hasValue = false;

    for (let col = range.s.c; col <= range.e.c; col += 1) {
      const originalHeader = headerRow[col - range.s.c];
      const mappedKey = headerMap[originalHeader];
      if (!mappedKey) continue;

      const cell = sheet[utils.encode_cell({ r: row, c: col })];
      const value = cell ? cell.v : "";
      parsed[mappedKey] = value;
      if (value !== undefined && value !== null && value !== "") {
        hasValue = true;
      }
    }

    if (hasValue) {
      parsedRows.push(parsed);
    }
  }

  return parsedRows;
}

function normalizeStatus(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";
  const statusMap = {
    "em andamento": "em_andamento",
    "em_andamento": "em_andamento",
    andamento: "em_andamento",
    finalizado: "finalizado",
    cancelado: "cancelado",
    novo: "novo",
  };
  return statusMap[raw] || raw.replace(/\s+/g, "_");
}

function isCurrentInShift(shiftStart, shiftEnd) {
  if (!shiftStart || !shiftEnd) return true;
  const now = new Date();
  const [startHour, startMinute] = shiftStart.split(":").map(Number);
  const [endHour, endMinute] = shiftEnd.split(":").map(Number);
  const start = new Date(now);
  start.setHours(startHour, startMinute, 0, 0);
  const end = new Date(now);
  end.setHours(endHour, endMinute, 0, 0);
  if (end < start) {
    return now >= start || now <= end;
  }
  return now >= start && now <= end;
}

async function loadAttendants() {
  const { data: userData, error: userError } = await supabase.from("usuarios").select("id,nome,perfil");
  if (!userError) {
    return (userData || []).map((user) => ({
      id: user.id,
      nome: user.nome,
      perfil: user.perfil,
      ativo: true,
    }));
  }

  console.warn("Tabela 'usuarios' não disponível, tentando 'atendentes' como fallback:", userError.message);
  const targetColumns = "id,nome,ativo,turno_inicio,turno_fim,limite_atendimentos";
  const { data, error } = await supabase.from("atendentes").select(targetColumns);

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

function chunkArray(items, chunkSize) {
  const chunks = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
}

async function fetchExistingProtocols(protocols, chunkSize = 20) {
  if (!protocols.length) {
    return [];
  }

  const chunks = chunkArray(protocols, chunkSize);
  console.log("fetchExistingProtocols chunks:", chunks.map((chunk) => chunk.length));
  const results = [];

  for (const chunk of chunks) {
    try {
      const { data, error } = await supabase
        .from("agendamentos")
        .select("id,protocolo,status")
        .in("protocolo", chunk);

      if (error) {
        throw error;
      }

      if (data?.length) {
        results.push(...data);
      }
    } catch (error) {
      console.warn(
        "fetchExistingProtocols.in() falhou, usando fallback por protocolo individual:",
        error.message,
        "chunk length:",
        chunk.length
      );

      for (const protocolo of chunk) {
        const { data, error: singleError } = await supabase
          .from("agendamentos")
          .select("id,protocolo,status")
          .eq("protocolo", protocolo);

        if (singleError) {
          console.warn("fetchExistingProtocols fallback erro para protocolo", protocolo, singleError.message);
          continue;
        }

        if (data?.length) {
          results.push(...data);
        }
      }
    }
  }

  return results;
}

async function getAttendantLoads(attendantIds) {
  if (!attendantIds.length) {
    return {};
  }

  const { data, error } = await supabase
    .from("agendamentos")
    .select("criado_por")
    .in("status", ["novo", "em_andamento"])
    .in("criado_por", attendantIds);

  if (error) {
    return {};
  }

  return (data || []).reduce((counts, item) => {
    if (!item.criado_por) return counts;
    counts[item.criado_por] = (counts[item.criado_por] || 0) + 1;
    return counts;
  }, {});
}

async function loadDefaultService() {
  const { data, error } = await supabase
    .from("servicos")
    .select("id,nome")
    .order("nome", { ascending: true })
    .limit(1);

  if (error) {
    return null;
  }

  return (data || [])[0] || null;
}

async function findServiceByName(servicoNome) {
  if (!servicoNome) return null;
  const normalized = String(servicoNome).trim();
  const { data, error } = await supabase
    .from("servicos")
    .select("id,nome")
    .ilike("nome", `%${normalized}%`)
    .limit(1);

  if (error) {
    return null;
  }

  return (data || [])[0] || null;
}

async function findOrCreateCliente({ nome, telefone }, currentUserId = null) {
  if (!nome && !telefone) {
    throw new Error("Cliente sem nome ou telefone não pode ser criado.");
  }

  const query = supabase.from("clientes").select("id,nome,telefone").limit(1);
  let resultPayload;

  if (telefone) {
    const normalizedPhone = String(telefone).replace(/\D/g, "");
    resultPayload = await query.ilike("telefone", `%${normalizedPhone}%`);
  } else {
    resultPayload = await query.ilike("nome", `%${nome}%`);
  }

  const { data: result, error: findError } = resultPayload;
  if (findError) {
    throw new Error(findError.message);
  }

  if (result?.[0]?.id) {
    return result[0].id;
  }

  const basePayload = {
    nome: nome || "Cliente importado",
  };
  if (telefone) {
    basePayload.telefone = telefone;
  }

  const insertPayload = { ...basePayload };
  if (currentUserId) {
    insertPayload.criado_por = currentUserId;
  }

  let { data: created, error: insertError } = await supabase
    .from("clientes")
    .insert([insertPayload])
    .select("id")
    .single();

  if (
    insertError &&
    insertError.message?.includes("Could not find the 'criado_por' column of 'clientes' in the schema cache")
  ) {
    const retryPayload = { ...basePayload };
    const { data: retryCreated, error: retryError } = await supabase
      .from("clientes")
      .insert([retryPayload])
      .select("id")
      .single();

    if (!retryError) {
      return retryCreated.id;
    }

    insertError = retryError;
  }

  if (insertError) {
    if (insertError.message?.includes("row-level security")) {
      throw new Error(
        "Permissão negada ao inserir cliente. Verifique as políticas RLS no Supabase para a tabela clientes."
      );
    }
    throw new Error(insertError.message);
  }

  return created.id;
}

export function useImportacao() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [uploadDate, setUploadDate] = useState(null);
  const [rows, setRows] = useState([]);
  const [previewRows, setPreviewRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [validationError, setValidationError] = useState("");
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [error, setError] = useState("");
  
  const cancelRef = useRef(false);

  function resetState() {
    setFile(null);
    setFileName("");
    setUploadDate(null);
    setRows([]);
    setPreviewRows([]);
    setHeaders([]);
    setRowCount(0);
    setValidationError("");
    setLoading(false);
    setProcessing(false);
    setProgress(0);
    setReport(null);
    setShowReport(false);
    setError("");
    cancelRef.current = false;
  }

  async function handleFileChange(event) {
    resetState();
    const selected = event.target.files?.[0];
    if (!selected) return;

    if (!/\.xlsx?$|\.xls$/i.test(selected.name)) {
      setValidationError("Selecione um arquivo .xlsx ou .xls válido.");
      return;
    }

    setLoading(true);
    setFile(selected);
    setFileName(selected.name);
    setUploadDate(new Date());

    try {
      const buffer = await selected.arrayBuffer();
      const workbook = read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      if (!sheet) {
        throw new Error("Não foi possível ler a primeira planilha.");
      }

      const rawRows = utils.sheet_to_json(sheet, { header: 1, defval: "" });
      console.log("XLSX.read() workbook has sheets:", workbook.SheetNames);
      console.log("sheet_to_json raw sample:", rawRows.slice(0, 5));

      const { headerRow, range } = getSheetHeaders(sheet);
      const mappedHeaders = headerRow.map((header) => getMappedHeader(normalizeHeader(header)));
      const missingColumns = REQUIRED_COLUMNS.filter((column) => !mappedHeaders.includes(column));

      if (missingColumns.length) {
        setValidationError(
          `Colunas obrigatórias ausentes: ${missingColumns.join(", ")}. Use pelo menos protocolo, cliente_nome, telefone e data_agendamento.`
        );
        return;
      }

      const parsedRows = getSheetRows(sheet, headerRow, range);
      const preview = parsedRows.slice(0, 5);

      console.log("Import preview headers:", headerRow);
      console.log("Mapped headers:", mappedHeaders);
      console.log("Linhas válidas encontradas:", parsedRows.length);
      console.log("Pré-visualização de linhas:", preview);

      setHeaders(mappedHeaders);
      setPreviewRows(preview);
      setRowCount(parsedRows.length);
      setRows(parsedRows);
    } catch (err) {
      setValidationError(err.message || "Falha ao ler o arquivo XLSX.");
    } finally {
      setLoading(false);
    }
  }

  async function processImport() {
    if (!file) {
      setError("Selecione um arquivo antes de processar a importação.");
      return;
    }

    cancelRef.current = false;
    setProcessing(true);
    setError("");
    setReport(null);
    setProgress(0);

    let rowsToProcess = rows;
    if (!rowsToProcess.length) {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 50));

      try {
        const buffer = await file.arrayBuffer();
        const workbook = read(buffer, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        if (!sheet) {
          throw new Error("Não foi possível ler a primeira planilha.");
        }

        const { headerRow, range } = getSheetHeaders(sheet);
        const parsedRows = getSheetRows(sheet, headerRow, range);
        setRows(parsedRows);
        setRowCount(parsedRows.length);
        rowsToProcess = parsedRows;
      } finally {
        setLoading(false);
      }
    }

    if (!rowsToProcess.length) {
      setProcessing(false);
      setError("Não há registros para importar.");
      return;
    }

    console.log("Importação iniciada", {
      fileName,
      rowCount: rowsToProcess.length,
      sampleRows: rowsToProcess.slice(0, 5),
    });

    const summary = {
      total: rowsToProcess.length,
      novos: 0,
      atualizados: 0,
      ignorados: 0,
      erros: 0,
      errorDetails: [],
    };

    try {
      const { data: { session } = {} } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id || null;
      if (!currentUserId) {
        console.warn("Nenhuma sessão de usuário ativa encontrada; agendamentos importados podem ser visíveis apenas se criados_por for definido corretamente.");
      }

      const defaultService = await loadDefaultService();
      const attendantsRaw = await loadAttendants();
      const attendants = attendantsRaw.filter((attendant) =>
        attendant.ativo === undefined || attendant.ativo === null ? true : attendant.ativo === true
      );
      const activeAttendants = attendants.filter((attendant) =>
        isCurrentInShift(parseTime(attendant.turno_inicio), parseTime(attendant.turno_fim))
      );
      const availableAttendants = activeAttendants.length ? activeAttendants : attendants;
      const attendantIds = availableAttendants.map((attendant) => attendant.id).filter(Boolean);
      const loadCounts = await getAttendantLoads(attendantIds);
      const attendantsWithLoad = availableAttendants.map((attendant) => ({
        ...attendant,
        _load: loadCounts[attendant.id] || 0,
      }));

      // Pre-fetch existing protocols em lotes para evitar query demasiado longa
      const protocolSet = [...new Set(rowsToProcess.map((row) => String(row.protocolo || "").trim()).filter(Boolean))];
      const existsData = await fetchExistingProtocols(protocolSet);

      const existingByProtocol = (existsData || []).reduce((acc, item) => {
        acc[item.protocolo] = item;
        return acc;
      }, {});

      // caches to reduce duplicate DB lookups
      const clienteCache = new Map();
      const serviceCache = new Map();

      const batchSize = 20;
      let processed = 0;

      for (let i = 0; i < rowsToProcess.length; i += batchSize) {
        if (cancelRef.current) {
          setError("Importação cancelada pelo usuário.");
          break;
        }

        const batch = rowsToProcess.slice(i, i + batchSize);

        const promises = batch.map(async (row) => {
          const protocolo = String(row.protocolo || "").trim();
          const clienteNome = String(row.cliente_nome || "").trim();
          const telefone = String(row.telefone || "").trim();
          const status = normalizeStatus(row.status);
          const dataAgendamento = parseDateValue(row.data_agendamento);
          const horaAgendamento = parseTime(row.hora_agendamento);

          if (!protocolo) {
            summary.erros += 1;
            summary.errorDetails.push(`Linha ${row._rowNumber}: protocolo ausente.`);
            return;
          }

          if (!dataAgendamento || !isValidDate(dataAgendamento)) {
            summary.erros += 1;
            summary.errorDetails.push(`Linha ${row._rowNumber}: data_agendamento inválida para protocolo ${protocolo}.`);
            return;
          }

          const createdAt = new Date().toISOString();
          const formattedDate = dataAgendamento.toISOString();
          const existing = existingByProtocol[protocolo];

          if (existing) {
            const currentStatus = String(existing.status || "").toLowerCase();
            const targetStatus = status || currentStatus;
            if (currentStatus === "finalizado" || currentStatus === "cancelado") {
              summary.ignorados += 1;
              summary.errorDetails.push(
                `Linha ${row._rowNumber}: protocolo ${protocolo} ignorado porque já está ${currentStatus}.`
              );
              console.log(`Ignorando protocolo ${protocolo} já ${currentStatus}`);
              try {
                await supabase.from("historico_movimentacao").insert([{ agendamento_id: existing.id, acao: "ignorado", descricao: `Já ${currentStatus} na importação`, criado_em: createdAt }]);
              } catch (e) {
                console.debug('historico insert ignored', e);
              }
              return;
            }

            try {
              const updatePayload = {
                status: targetStatus,
                data_agendamento: formattedDate,
                observacao: `Atualizado pela importação em ${new Date(createdAt).toLocaleString()}`,
                updated_at: createdAt,
              };

              if (horaAgendamento) {
                updatePayload.hora_agendamento = horaAgendamento;
              }

              const { error: updateError } = await supabase
                .from("agendamentos")
                .update(updatePayload)
                .eq("id", existing.id);

              if (updateError) {
                summary.erros += 1;
                summary.errorDetails.push(`Linha ${row._rowNumber}: falha ao atualizar protocolo ${protocolo} (${updateError.message}).`);
              } else {
                summary.atualizados += 1;
                try {
                  await supabase.from("historico_movimentacao").insert([{ agendamento_id: existing.id, acao: "atualizado", descricao: "Atualizado pela importação", criado_em: createdAt }]);
                } catch (e) {
                  console.debug('historico insert ignored', e);
                }
              }
            } catch (err) {
              summary.erros += 1;
              summary.errorDetails.push(`Linha ${row._rowNumber}: erro ao atualizar protocolo ${protocolo} (${err.message}).`);
            }

            return;
          }

          // criação de novo agendamento
          try {
            // cliente: tente cache por telefone, depois por nome
            const clienteKey = telefone || clienteNome;
            let clienteId = clienteCache.get(clienteKey);
            if (!clienteId) {
              clienteId = await findOrCreateCliente({ nome: clienteNome, telefone }, currentUserId);
              clienteCache.set(clienteKey, clienteId);
            }

            // attendant: escolher o com menor carga
            const attendant = attendantsWithLoad.length
              ? attendantsWithLoad.reduce((prev, current) => {
                  const prevLoad = prev._load || 0;
                  const currentLoad = current._load || 0;
                  return prevLoad <= currentLoad ? prev : current;
                })
              : null;

            // serviço: cache por nome
            const serviceKey = String(row.servico_nome || "").trim();
            let selectedService = null;
            if (serviceKey) {
              if (serviceCache.has(serviceKey)) {
                selectedService = serviceCache.get(serviceKey);
              } else {
                selectedService = await findServiceByName(serviceKey);
                serviceCache.set(serviceKey, selectedService);
              }
            }

            const insertPayload = {
              cliente_id: clienteId,
              servico_id: selectedService?.id || defaultService?.id || null,
              data_agendamento: formattedDate,
              hora_agendamento: horaAgendamento || "00:00",
              status: "novo",
              observacao: `Importado da base diária em ${new Date(createdAt).toLocaleString()}`,
              criado_por: currentUserId || attendant?.id || null,
              updated_at: createdAt,
            };

            console.log("Inserindo novo agendamento", protocolo, insertPayload);
            const { data: newRecord, error: insertError } = await supabase
              .from("agendamentos")
              .insert([insertPayload])
              .select("id")
              .single();

            if (insertError) {
              console.error("Erro ao inserir novo agendamento", protocolo, insertError.message);
              summary.erros += 1;
              summary.errorDetails.push(`Linha ${row._rowNumber}: falha ao criar protocolo ${protocolo} (${insertError.message}).`);
            } else {
              summary.novos += 1;
              console.log("Novo agendamento criado", protocolo, newRecord?.id);
              try {
                await supabase.from("historico_movimentacao").insert([{ agendamento_id: newRecord.id, acao: "novo", descricao: "Importado da base diária", criado_em: createdAt }]);
              } catch (e) {
                console.debug('historico insert ignored', e);
              }
            }
          } catch (clienteError) {
            summary.erros += 1;
            summary.errorDetails.push(`Linha ${row._rowNumber}: ${clienteError.message}`);
          }
        });

        await Promise.allSettled(promises);
        processed += batch.length;
        setProgress(Math.round((processed / rowsToProcess.length) * 100));

        // small delay to yield to event loop for large imports
        await new Promise((r) => setTimeout(r, 50));
      }

      setReport(summary);
      setShowReport(true);
      window.dispatchEvent(new CustomEvent("agendamentos:updated", { detail: summary }));
    } catch (err) {
      setError(err.message || "Falha na importação.");
    } finally {
      setProcessing(false);
      setProgress(100);
    }
  }

  function cancelImport() {
    cancelRef.current = true;
  }

  return {
    file,
    fileName,
    uploadDate,
    rowCount,
    headers,
    previewRows,
    validationError,
    loading,
    processing,
    progress,
    report,
    showReport,
    error,
    handleFileChange,
    processImport,
    cancelImport,
    resetState,
  };
}
