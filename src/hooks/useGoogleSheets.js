import { useCallback, useState } from "react";
import { supabase } from "../lib/supabase";

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
  if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
  return raw;
}

function extractBairro(addr) {
  if (!addr) return "";
  const parts = addr.split(",");
  return parts.length > 1 ? parts[1].trim() : addr.trim();
}

export function useGoogleSheets() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [syncedAt, setSyncedAt] = useState(null);

  const fetchFromAPI = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/sheets");
      const data = await response.json();

      if (data.error) throw new Error(data.error);
      if (!data.rows || data.rows.length === 0) {
        setRows([]);
        setLoading(false);
        return [];
      }

      setRows(data.rows);
      setSyncedAt(new Date());
      setLoading(false);
      return data.rows;
    } catch (err) {
      console.error("Erro ao buscar planilha:", err);
      setError(err.message);
      setLoading(false);
      return [];
    }
  }, []);

  const syncToSupabase = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const sheetRows = rows.length > 0 ? rows : await fetchFromAPI();
      if (!sheetRows || sheetRows.length === 0) {
        setLoading(false);
        return { synced: 0, errors: 0 };
      }

      let synced = 0;
      let errors = 0;

      for (const row of sheetRows) {
        if (!row.protocolo && !row.cliente_nome) continue;
        try {
          const { error: upsertError } = await supabase
            .from("agendamentos")
            .upsert({
              protocolo: row.protocolo || null,
              cliente_nome: row.cliente_nome,
              telefone: row.telefone,
              status: row.status,
              data_agendamento: row.data_agendamento,
              bairro: row.bairro,
              servico_nome: row.servico_nome,
              hora_agendamento: row.hora_agendamento,
              atendente_nome: row.atendente_nome,
              fonte: "google_sheets",
              updated_at: new Date().toISOString(),
            }, { onConflict: "protocolo", ignoreDuplicates: false });

          if (upsertError) {
            console.error("Erro ao sincronizar:", upsertError);
            errors++;
          } else {
            synced++;
          }
        } catch (e) {
          errors++;
        }
      }

      setSyncedAt(new Date());
      setLoading(false);
      return { synced, errors };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { synced: 0, errors: 1 };
    }
  }, [rows, fetchFromAPI]);

  return { loading, error, rows, syncedAt, fetchFromAPI, syncToSupabase };
}
