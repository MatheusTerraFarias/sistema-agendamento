import { useCallback, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

const AREAS = ["SP2", "ITAIM"];

export function useDistribuicao() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [atendentes, setAtendentes] = useState([]);
  const [regras, setRegras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [executing, setExecuting] = useState(false);

  // Carregar agendamentos disponíveis (não distribuídos, status novo)
  const loadAgendamentos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("agendamentos")
        .select("id, area, bairro, servico_id, status, distribuido_para, criado_por")
        .eq("status", "novo")
        .is("distribuido_para", null)
        .order("created_at", { ascending: false });

      if (err) throw err;

      // Buscar nomes dos servicos
      const servicoIds = [...new Set((data || []).map((a) => a.servico_id).filter(Boolean))];
      let servicoMap = {};
      if (servicoIds.length) {
        const { data: servicos } = await supabase.from("servicos").select("id, nome").in("id", servicoIds);
        (servicos || []).forEach((s) => { servicoMap[s.id] = s.nome; });
      }

      const items = (data || []).map((a) => ({
        ...a,
        servico_nome: servicoMap[a.servico_id] || "Sem serviço",
      }));

      setAgendamentos(items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar atendentes
  const loadAtendentes = useCallback(async () => {
    try {
      const { data, error: err } = await supabase
        .from("usuarios")
        .select("id, nome, perfil")
        .in("perfil", ["atendente", "supervisor", "supervisora"]);

      if (err) throw err;
      setAtendentes(data || []);
    } catch (err) {
      console.error("Erro ao carregar atendentes:", err);
    }
  }, []);

  // Carregar regras salvas
  const loadRegras = useCallback(async () => {
    try {
      const { data, error: err } = await supabase
        .from("regras_distribuicao")
        .select("*")
        .eq("ativo", true)
        .order("criado_em", { ascending: false });

      if (err) throw err;
      setRegras(data || []);
    } catch (err) {
      console.error("Erro ao carregar regras:", err);
    }
  }, []);

  // Salvar regra
  const salvarRegra = useCallback(async (regra) => {
    try {
      const { error: err } = await supabase.from("regras_distribuicao").insert([regra]);
      if (err) throw err;
      await loadRegras();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [loadRegras]);

  // Deletar regra
  const deletarRegra = useCallback(async (id) => {
    try {
      const { error: err } = await supabase.from("regras_distribuicao").update({ ativo: false }).eq("id", id);
      if (err) throw err;
      await loadRegras();
    } catch (err) {
      setError(err.message);
    }
  }, [loadRegras]);

  // Filtrar agendamentos
  const filtrarAgendamentos = useCallback((filtro) => {
    let result = [...agendamentos];
    if (filtro.areas?.length) {
      result = result.filter((a) => filtro.areas.includes(a.area));
    }
    if (filtro.tipos?.length) {
      result = result.filter((a) => filtro.tipos.includes(a.servico_nome));
    }
    return result;
  }, [agendamentos]);

  // Calcular preview da distribuição
  const calcularPreview = useCallback((agendamentosFiltrados, atendentesIds, modo, regrasCustom) => {
    const total = agendamentosFiltrados.length;

    // Breakdown por área
    const porArea = {};
    agendamentosFiltrados.forEach((a) => {
      const area = a.area || "Não definido";
      porArea[area] = (porArea[area] || 0) + 1;
    });

    // Breakdown por tipo
    const porTipo = {};
    agendamentosFiltrados.forEach((a) => {
      const tipo = a.servico_nome || "Sem serviço";
      porTipo[tipo] = (porTipo[tipo] || 0) + 1;
    });

    // Selecionar atendentes
    const atendentesSelecionados = atendentes.filter((a) => atendentesIds.includes(a.id));
    const numAtendentes = atendentesSelecionados.length;

    const distribuicao = [];
    const warnings = [];

    if (numAtendentes === 0) {
      warnings.push("Nenhum atendente selecionado.");
      setPreview({ total, porArea, porTipo, distribuicao, warnings });
      return;
    }

    if (total === 0) {
      warnings.push("Nenhuma atividade disponível para distribuição.");
      setPreview({ total, porArea, porTipo, distribuicao, warnings });
      return;
    }

    if (modo === "igualitario") {
      const base = Math.floor(total / numAtendentes);
      const resto = total % numAtendentes;
      atendentesSelecionados.forEach((at, i) => {
        const qtd = base + (i < resto ? 1 : 0);
        distribuicao.push({
          id: at.id,
          nome: at.nome,
          quantidade: qtd,
          percentual: total > 0 ? Math.round((qtd / total) * 100) : 0,
        });
      });
    } else if (modo === "quantidade") {
      let somaQtd = 0;
      (regrasCustom || []).forEach((r) => {
        const at = atendentesSelecionados.find((a) => a.id === r.atendente_id);
        if (at) {
          somaQtd += r.quantidade || 0;
          distribuicao.push({
            id: at.id,
            nome: at.nome,
            quantidade: r.quantidade || 0,
            percentual: total > 0 ? Math.round(((r.quantidade || 0) / total) * 100) : 0,
          });
        }
      });
      if (somaQtd > total) {
        warnings.push(`Quantidade total (${somaQtd}) excede o disponível (${total}).`);
      }
      if (somaQtd < total) {
        warnings.push(`Sobra(m) ${total - somaQtd} atividade(s) sem distribuir.`);
      }
    } else if (modo === "percentual") {
      let somaPct = 0;
      (regrasCustom || []).forEach((r) => {
        const at = atendentesSelecionados.find((a) => a.id === r.atendente_id);
        if (at) {
          const pct = r.percentual || 0;
          somaPct += pct;
          const qtd = Math.round((pct / 100) * total);
          distribuicao.push({
            id: at.id,
            nome: at.nome,
            quantidade: qtd,
            percentual: pct,
          });
        }
      });
      if (somaPct > 100) {
        warnings.push(`Percentual total (${somaPct}%) excede 100%.`);
      }
      if (somaPct < 100) {
        warnings.push(`Percentual total (${somaPct}%) é menor que 100%. Sobram ${100 - somaPct}%.`);
      }
    }

    setPreview({ total, porArea, porTipo, distribuicao, warnings });
  }, [atendentes]);

  // Executar distribuição
  const executarDistribuicao = useCallback(async (agendamentosFiltrados, distribuicao, regraId = null) => {
    setExecuting(true);
    setError(null);
    let erros = 0;
    let distributed = 0;

    try {
      // Criar fila de distribuição
      const fila = [];
      distribuicao.forEach((d) => {
        for (let i = 0; i < d.quantidade; i++) {
          fila.push(d.id);
        }
      });

      // Embaralhar para distribuir de forma mais均匀
      for (let i = fila.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [fila[i], fila[j]] = [fila[j], fila[i]];
      }

      // Atualizar agendamentos
      const promises = agendamentosFiltrados.map((ag, idx) => {
        if (idx >= fila.length) return Promise.resolve();
        const atendenteId = fila[idx];
        return supabase
          .from("agendamentos")
          .update({ distribuido_para: atendenteId, updated_at: new Date().toISOString() })
          .eq("id", ag.id)
          .then(({ error }) => {
            if (error) { erros++; console.error(error); }
            else distributed++;
          });
      });

      await Promise.allSettled(promises);

      // Salvar histórico
      const porArea = {};
      const porTipo = {};
      agendamentosFiltrados.forEach((a) => {
        porArea[a.area || "Não definido"] = (porArea[a.area || "Não definido"] || 0) + 1;
        porTipo[a.servico_nome || "Sem serviço"] = (porTipo[a.servico_nome || "Sem serviço"] || 0) + 1;
      });

      await supabase.from("historico_distribuicao").insert([{
        regra_id: regraId,
        total_atividades: distributed,
        por_area: porArea,
        por_tipo: porTipo,
        distribuicao: distribuicao.map((d) => ({
          atendente_id: d.id,
          nome: d.nome,
          quantidade: d.quantidade,
          percentual: d.percentual,
        })),
        criado_por: (await supabase.auth.getUser()).data.user?.id,
      }]);

      await loadAgendamentos();
      setPreview(null);
      return { distributed, erros };
    } catch (err) {
      setError(err.message);
      return { distributed: 0, erros: 1 };
    } finally {
      setExecuting(false);
    }
  }, [loadAgendamentos]);

  // Listas auxiliares para filtros
  const areas = useMemo(() => AREAS, []);
  const tipos = useMemo(() => {
    const set = new Set(agendamentos.map((a) => a.servico_nome).filter(Boolean));
    return [...set].sort();
  }, [agendamentos]);

  return {
    agendamentos,
    atendentes,
    regras,
    loading,
    error,
    preview,
    executing,
    areas,
    tipos,
    loadAgendamentos,
    loadAtendentes,
    loadRegras,
    salvarRegra,
    deletarRegra,
    filtrarAgendamentos,
    calcularPreview,
    executarDistribuicao,
    setPreview,
  };
}
