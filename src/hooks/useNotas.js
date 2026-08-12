import { useCallback, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

const SELECT_FIELDS = "id, chamado_id, usuario_id, usuario_nome, conteudo, criado_em, atualizado_em";

export function useNotas({ session, profile }) {
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const chamadoIdRef = useRef(null);

  const loadNotas = useCallback(async (chamadoId) => {
    if (!chamadoId) {
      setNotas([]);
      return;
    }
    chamadoIdRef.current = chamadoId;
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from("notas_chamados")
      .select(SELECT_FIELDS)
      .eq("chamado_id", chamadoId)
      .order("criado_em", { ascending: false });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setNotas(data || []);
    setLoading(false);
  }, []);

  const addNota = useCallback(async (conteudo) => {
    const chamadoId = chamadoIdRef.current;
    const texto = String(conteudo || "").trim();
    if (!chamadoId || !texto) return null;

    setSaving(true);
    setError(null);
    setSuccess(null);

    const { data, error: err } = await supabase
      .from("notas_chamados")
      .insert([{
        chamado_id: chamadoId,
        usuario_id: session?.user?.id || null,
        usuario_nome: profile?.nome || "",
        conteudo: texto,
      }])
      .select(SELECT_FIELDS)
      .single();

    setSaving(false);
    if (err) {
      setError(err.message);
      return null;
    }

    setNotas((prev) => [data, ...prev]);
    setSuccess("Nota adicionada com sucesso.");
    return data;
  }, [session, profile]);

  const updateNota = useCallback(async (id, conteudo) => {
    const texto = String(conteudo || "").trim();
    if (!texto) return null;

    setSaving(true);
    setError(null);
    setSuccess(null);

    const { data, error: err } = await supabase
      .from("notas_chamados")
      .update({ conteudo: texto, atualizado_em: new Date().toISOString() })
      .eq("id", id)
      .select(SELECT_FIELDS)
      .single();

    setSaving(false);
    if (err) {
      setError(err.message);
      return null;
    }

    setNotas((prev) => prev.map((nota) => (nota.id === id ? data : nota)));
    setSuccess("Nota atualizada com sucesso.");
    return data;
  }, []);

  const deleteNota = useCallback(async (id) => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    const { error: err } = await supabase
      .from("notas_chamados")
      .delete()
      .eq("id", id);

    setSaving(false);
    if (err) {
      setError(err.message);
      return false;
    }

    setNotas((prev) => prev.filter((nota) => nota.id !== id));
    setSuccess("Nota excluida com sucesso.");
    return true;
  }, []);

  return {
    notas,
    loading,
    saving,
    error,
    success,
    setSuccess,
    loadNotas,
    addNota,
    updateNota,
    deleteNota,
  };
}
