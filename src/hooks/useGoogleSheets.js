import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutos

export function useGoogleSheets({ autoSync = true } = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [syncedAt, setSyncedAt] = useState(null);
  const [autoSyncing, setAutoSyncing] = useState(false);
  const [lastAutoSync, setLastAutoSync] = useState(null);
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  const fetchFromAPI = useCallback(async (isAuto = false) => {
    if (isAuto) setAutoSyncing(true);
    else setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/sheets");
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      if (mountedRef.current) {
        setRows(data.rows || []);
        setSyncedAt(new Date());
        if (isAuto) setLastAutoSync(new Date());
      }
      if (isAuto) setAutoSyncing(false);
      else setLoading(false);
      return data.rows || [];
    } catch (err) {
      console.error("Erro ao buscar planilha:", err);
      if (mountedRef.current) setError(err.message);
      if (isAuto) setAutoSyncing(false);
      else setLoading(false);
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

      const rowsToSync = sheetRows.filter(r => r.protocolo);
      const protocolos = rowsToSync.map(r => r.protocolo);

      const { data: existing } = await supabase
        .from("agendamentos")
        .select("id,protocolo")
        .in("protocolo", protocolos);

      const existMap = new Map((existing || []).map(e => [e.protocolo, e.id]));

      let synced = 0;
      let errors = 0;

      const payload = rowsToSync.map(row => {
        const id = existMap.get(row.protocolo);
        const base = {
          protocolo: row.protocolo,
          cliente_nome: row.cliente_nome,
          telefone: row.telefone,
          status: row.status,
          data_agendamento: row.data_agendamento,
          hora_agendamento: row.hora_agendamento || "00:00",
          bairro: row.bairro,
          fonte: "google_sheets",
          updated_at: new Date().toISOString(),
        };
        return id ? { id, ...base } : base;
      });

      const toUpdate = payload.filter(p => p.id);
      const skipped = payload.filter(p => !p.id);

      for (const item of toUpdate) {
        const { id, ...fields } = item;
        const { error: updErr } = await supabase.from("agendamentos").update(fields).eq("id", id);
        if (updErr) { console.error("Erro ao atualizar:", updErr); errors++; }
        else synced++;
      }

      setSyncedAt(new Date());
      setLoading(false);
      return { synced, errors, skipped: skipped?.length || 0 };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { synced: 0, errors: 1 };
    }
  }, [rows, fetchFromAPI]);

  // Auto-sync: busca da API a cada 5 minutos e sincroniza com Supabase
  useEffect(() => {
    if (!autoSync) return;

    mountedRef.current = true;

    const runAutoSync = async () => {
      if (!mountedRef.current) return;
      try {
        const sheetRows = await fetchFromAPI(true);
        if (!sheetRows || sheetRows.length === 0) return;

        const rowsToSync = sheetRows.filter(r => r.protocolo);
        const protocolos = rowsToSync.map(r => r.protocolo);

        const { data: existing } = await supabase
          .from("agendamentos")
          .select("id,protocolo")
          .in("protocolo", protocolos);

        const existMap = new Map((existing || []).map(e => [e.protocolo, e.id]));

        const payload = rowsToSync.map(row => {
          const id = existMap.get(row.protocolo);
          const base = {
            protocolo: row.protocolo,
            cliente_nome: row.cliente_nome,
            telefone: row.telefone,
            status: row.status,
            data_agendamento: row.data_agendamento,
            hora_agendamento: row.hora_agendamento || "00:00",
            bairro: row.bairro,
            fonte: "google_sheets",
            updated_at: new Date().toISOString(),
          };
          return id ? { id, ...base } : base;
        });

        const toUpdate = payload.filter(p => p.id);
        for (const item of toUpdate) {
          const { id, ...fields } = item;
          await supabase.from("agendamentos").update(fields).eq("id", id);
        }
      } catch (err) {
        console.error("Auto-sync error:", err);
      }
    };

    // Sync imediato ao montar
    runAutoSync();

    // Sync a cada 5 minutos
    intervalRef.current = setInterval(runAutoSync, SYNC_INTERVAL_MS);

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoSync, fetchFromAPI]);

  return { loading, error, rows, syncedAt, autoSyncing, lastAutoSync, fetchFromAPI, syncToSupabase };
}
