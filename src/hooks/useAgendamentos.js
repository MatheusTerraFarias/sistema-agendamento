import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

const SUPERVISOR_ROLES = ["supervisora", "supervisor", "admin"];
const ATTENDANT_ROLES = ["atendente", "supervisor", "supervisora", "admin"];
const ACTIVE_STATUSES = ["novo", "em_andamento"];

function isSupervisorProfile(perfil) {
  return SUPERVISOR_ROLES.includes(String(perfil || "").toLowerCase());
}

function isAtendenteProfile(perfil) {
  return ATTENDANT_ROLES.includes(String(perfil || "").toLowerCase());
}

function generateUuid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function useAgendamentos() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [agendamentos, setAgendamentos] = useState([]);
  const [atendentes, setAtendentes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const clientesRef = useRef([]);

  const isSupervisor = useMemo(() => isSupervisorProfile(profile?.perfil), [profile]);

  useEffect(() => {
    clientesRef.current = clientes;
  }, [clientes]);

  const loadProfile = useCallback(async (userId) => {
    const { data, error: profileError } = await supabase
      .from("usuarios")
      .select("perfil, nome")
      .eq("id", userId)
      .limit(1);

    if (profileError) {
      setError(profileError.message);
      return;
    }

    if (Array.isArray(data)) {
      if (data.length > 1) {
        console.warn("Usuário duplicado encontrado em usuarios, usando o primeiro registro.", userId);
      }
      setProfile(data[0] || null);
      return;
    }

    setProfile(data || null);
  }, []);

  const loadAtendentes = useCallback(async () => {
    const { data, error } = await supabase
      .from("usuarios")
      .select("id, nome, perfil")
      .order("nome", { ascending: true });

    if (error) {
      setError(error.message);
      return [];
    }

    const filtered = (data || []).filter((item) => isAtendenteProfile(item.perfil));
    setAtendentes(filtered);
    return filtered;
  }, []);

  const createUsuario = useCallback(
    async ({ id, nome, email, perfil }) => {
      setLoading(true);
      setError(null);

      const insertPayload = {
        id: id || generateUuid(),
        nome,
        email,
        perfil,
      };

      const { data, error } = await supabase
        .from("usuarios")
        .insert([insertPayload])
        .select()
        .single();

      if (error) {
        setError(error.message);
        setLoading(false);
        return null;
      }

      await loadAtendentes();
      setLoading(false);
      return data;
    },
    [loadAtendentes]
  );

  const loadClientes = useCallback(async () => {
    const { data, error } = await supabase
      .from("clientes")
      .select("id, nome, telefone")
      .order("nome", { ascending: true });

    if (error) {
      setError(error.message);
      return [];
    }

    setClientes(data || []);
    return data || [];
  }, []);

  const loadServicos = useCallback(async () => {
    const { data, error } = await supabase
      .from("servicos")
      .select("id, nome")
      .order("nome", { ascending: true });

    if (error) {
      setError(error.message);
      return [];
    }

    setServicos(data || []);
    return data || [];
  }, []);

  const loadAgendamentos = useCallback(
    async (filter = "todos", search = "", clients = null) => {
      setLoading(true);
      setError(null);

      let query = supabase.from("agendamentos").select("*").order("created_at", { ascending: false });

      if (!isSupervisor && session?.user?.id) {
        query = query.eq("criado_por", session.user.id);
      }

      if (filter && filter !== "todos") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;
      if (error) {
        setError(error.message);
        setAgendamentos([]);
        setLoading(false);
        return;
      }

      let items = data || [];
      if (search) {
        const normalized = search.toLowerCase();
        const lookupClients = clients || clientesRef.current;
        items = items.filter((item) => {
          const cliente = lookupClients.find((client) => client.id === item.cliente_id);
          const clienteNome = cliente?.nome?.toLowerCase() || "";
          const clienteTelefone = cliente?.telefone?.toLowerCase() || "";
          return (
            clienteNome.includes(normalized) ||
            clienteTelefone.includes(normalized) ||
            item.observacao?.toLowerCase().includes(normalized)
          );
        });
      }

      setAgendamentos(items);
      setLoading(false);
    },
    [isSupervisor, session]
  );

  const loadAll = useCallback(
    async (filter = "todos", search = "") => {
      setLoading(true);
      setError(null);

      try {
        const loadedClientes = await loadClientes();
        await Promise.all([loadAtendentes(), loadServicos()]);
        await loadAgendamentos(filter, search, loadedClientes);
      } finally {
        setLoading(false);
      }
    },
    [loadAtendentes, loadClientes, loadServicos, loadAgendamentos]
  );

  useEffect(() => {
    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);
      if (session) {
        loadProfile(session.user.id);
      }
    }

    loadSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session || null);
      if (session) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [loadProfile]);

  useEffect(() => {
    const handleUpdated = () => {
      if (!session) return;
      loadAll();
    };

    window.addEventListener("agendamentos:updated", handleUpdated);
    return () => window.removeEventListener("agendamentos:updated", handleUpdated);
  }, [loadAll, session]);


  async function getTaskCounts(atendenteIds) {
    if (!atendenteIds.length) {
      return {};
    }

    const { data, error } = await supabase
      .from("agendamentos")
      .select("criado_por")
      .in("status", ACTIVE_STATUSES)
      .in("criado_por", atendenteIds);

    if (error) {
      setError(error.message);
      return {};
    }

    return (data || []).reduce((acc, item) => {
      const key = item.criado_por;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  async function findBestAtendente() {
    if (!atendentes.length) return null;

    const taskCounts = await getTaskCounts(atendentes.map((item) => item.id));
    const sorted = [...atendentes].sort((left, right) => {
      const leftCount = taskCounts[left.id] || 0;
      const rightCount = taskCounts[right.id] || 0;
      return leftCount - rightCount;
    });

    return sorted[0] || null;
  }

  async function createAgendamento(payload) {
    setLoading(true);
    setError(null);

    const atendente = await findBestAtendente();
    const values = {
      cliente_id: payload.cliente_id,
      servico_id: payload.servico_id,
      area: payload.area || null,
      data_agendamento: payload.data_agendamento,
      hora_agendamento: payload.hora_agendamento,
      status: "novo",
      observacao: payload.observacao || null,
      criado_por: atendente?.id || session?.user?.id || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from("agendamentos").insert([values]).select().single();
    if (error) {
      setError(error.message);
      setLoading(false);
      return null;
    }

    await loadAgendamentos();
    setLoading(false);
    return data;
  }

  async function updateAgendamento(id, payload) {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("agendamentos")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      setError(error.message);
      setLoading(false);
      return null;
    }

    await loadAgendamentos();
    setLoading(false);
    return data;
  }

  async function cancelAgendamentos(ids = []) {
    if (!ids || ids.length === 0) return;

    setLoading(true);
    setError(null);

    const { error } = await supabase
      .from("agendamentos")
      .update({ status: "cancelado", updated_at: new Date().toISOString() })
      .in("id", ids);

    if (error) {
      setError(error.message);
    } else {
      await loadAgendamentos();
    }

    setLoading(false);
  }

  async function cancelAgendamento(id) {
    return cancelAgendamentos([id]);
  }

  async function reatribuirAgendamento(id, paraAtendenteId, motivo) {
    if (Array.isArray(id)) {
      return reatribuirAgendamentos(id, paraAtendenteId, motivo);
    }

    setLoading(true);
    setError(null);

    const agendamentoResponse = await supabase.from("agendamentos").select("*").eq("id", id).single();
    if (agendamentoResponse.error) {
      setError(agendamentoResponse.error.message);
      setLoading(false);
      return null;
    }

    const agendamento = agendamentoResponse.data;
    const deAtendente = atendentes.find((user) => user.id === agendamento.criado_por);
    const paraAtendente = atendentes.find((user) => user.id === paraAtendenteId);
    const nota = `Reatribuído de ${deAtendente?.nome || "desconhecido"} para ${paraAtendente?.nome || "desconhecido"}: ${motivo}`;
    const observacaoAtual = agendamento.observacao ? `${agendamento.observacao}\n${nota}` : nota;

    const { error } = await supabase
      .from("agendamentos")
      .update({
        criado_por: paraAtendenteId,
        observacao: observacaoAtual,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      setError(error.message);
      setLoading(false);
      return null;
    }

    await loadAgendamentos();
    setLoading(false);
    return true;
  }

  async function reatribuirAgendamentos(ids = [], paraAtendenteId, motivo) {
    if (!ids.length || !paraAtendenteId || !motivo?.trim()) return null;

    setLoading(true);
    setError(null);
    const { data: selected, error: fetchError } = await supabase
      .from("agendamentos")
      .select("id,criado_por,observacao")
      .in("id", ids);

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return null;
    }

    const target = atendentes.find((user) => user.id === paraAtendenteId);
    const now = new Date().toISOString();
    const results = await Promise.all((selected || []).map((item) => {
      const source = atendentes.find((user) => user.id === item.criado_por);
      const note = `Reatribuído de ${source?.nome || "desconhecido"} para ${target?.nome || "desconhecido"}: ${motivo.trim()}`;
      return supabase.from("agendamentos").update({
        criado_por: paraAtendenteId,
        observacao: item.observacao ? `${item.observacao}\n${note}` : note,
        updated_at: now,
      }).eq("id", item.id);
    }));
    const failed = results.find((result) => result.error);
    if (failed?.error) {
      setError(failed.error.message);
      setLoading(false);
      return null;
    }

    await loadAgendamentos();
    setLoading(false);
    return true;
  }

  return {
    session,
    profile,
    agendamentos,
    atendentes,
    clientes,
    servicos,
    loading,
    error,
    isSupervisor,
    loadAll,
    loadAtendentes,
    loadAgendamentos,
    createAgendamento,
    updateAgendamento,
    cancelAgendamento,
    cancelAgendamentos,
    reatribuirAgendamento,
    reatribuirAgendamentos,
    createUsuario,
  };
}
