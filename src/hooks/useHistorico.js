import { useCallback, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

const SELECT_FIELDS = "id, agendamento_id, usuario_id, usuario_nome, acao, descricao, campos_alterados, criado_em";

export function useHistorico({ session, profile }) {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const agendamentoIdRef = useRef(null);

  const loadHistorico = useCallback(async (agendamentoId) => {
    if (!agendamentoId) {
      setHistorico([]);
      return;
    }
    agendamentoIdRef.current = agendamentoId;
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from("historico_edicoes")
      .select(SELECT_FIELDS)
      .eq("agendamento_id", agendamentoId)
      .order("criado_em", { ascending: false });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setHistorico(data || []);
    setLoading(false);
  }, []);

  const registrarHistorico = useCallback(async ({ agendamentoId, acao = "edicao", descricao = "", camposAlterados = [] }) => {
    const chamadoId = agendamentoId || agendamentoIdRef.current;
    if (!chamadoId) return null;

    const { data, error: err } = await supabase
      .from("historico_edicoes")
      .insert([{
        agendamento_id: chamadoId,
        usuario_id: session?.user?.id || null,
        usuario_nome: profile?.nome || "",
        acao,
        descricao: String(descricao || "").slice(0, 1000),
        campos_alterados: Array.isArray(camposAlterados) ? camposAlterados : [],
      }])
      .select(SELECT_FIELDS)
      .single();

    if (err) {
      console.error("Erro ao registrar historico:", err.message);
      return null;
    }

    setHistorico((prev) => [data, ...prev]);
    return data;
  }, [session, profile]);

  return {
    historico,
    loading,
    error,
    loadHistorico,
    registrarHistorico,
  };
}
