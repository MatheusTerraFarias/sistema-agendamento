import { useEffect, useState } from "react";
import { FaRandom, FaSave, FaTrash, FaCheckCircle, FaChevronDown, FaChevronUp, FaRegListAlt } from "react-icons/fa";
import { useDistribuicao } from "../hooks/useDistribuicao";
import DistributionPreview from "../components/DistributionPreview";
import Header from "../components/layout/Header";

export default function Distribuicao() {
  const { atendentes, regras, loading, error, preview, executing, areas, tipos, loadAgendamentos, loadAtendentes, loadRegras, salvarRegra, deletarRegra, filtrarAgendamentos, calcularPreview, executarDistribuicao, setPreview } = useDistribuicao();

  const [filtroAreas, setFiltroAreas] = useState([]);
  const [filtroTipos, setFiltroTipos] = useState([]);
  const [atendentesIds, setAtendentesIds] = useState([]);
  const [modo, setModo] = useState("igualitario");
  const [regrasCustom, setRegrasCustom] = useState([]);
  const [nomeRegra, setNomeRegra] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [showRegras, setShowRegras] = useState(false);

  useEffect(() => { loadAgendamentos(); loadAtendentes(); loadRegras(); }, [loadAgendamentos, loadAtendentes, loadRegras]);

  const agendamentosFiltrados = filtrarAgendamentos({ areas: filtroAreas, tipos: filtroTipos });

  const toggleArea = (area) => setFiltroAreas((p) => p.includes(area) ? p.filter((a) => a !== area) : [...p, area]);
  const toggleTipo = (tipo) => setFiltroTipos((p) => p.includes(tipo) ? p.filter((t) => t !== tipo) : [...p, tipo]);
  const toggleAtendente = (id) => setAtendentesIds((prev) => { const next = prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]; setRegrasCustom((r) => r.filter((x) => next.includes(x.atendente_id))); return next; });
  const toggleAllAtendentes = () => { if (atendentesIds.length === atendentes.length) { setAtendentesIds([]); setRegrasCustom([]); } else { setAtendentesIds(atendentes.map((a) => a.id)); } };

  const atualizarRegra = (atendenteId, campo, valor) => {
    setRegrasCustom((prev) => {
      const existente = prev.find((r) => r.atendente_id === atendenteId);
      if (existente) return prev.map((r) => r.atendente_id === atendenteId ? { ...r, [campo]: valor } : r);
      return [...prev, { atendente_id: atendenteId, [campo]: valor }];
    });
  };

  const handlePreview = () => calcularPreview(agendamentosFiltrados, atendentesIds, modo, regrasCustom);
  const handleConfirm = async () => { const result = await executarDistribuicao(agendamentosFiltrados, preview.distribuicao, null); if (result) { setResultado(result); setTimeout(() => setResultado(null), 5000); } };
  const aplicarRegra = (regra) => { setFiltroAreas(regra.areas || []); setFiltroTipos(regra.tipos_atividade || []); setAtendentesIds(regra.atendentes || []); setModo(regra.modo || "igualitario"); setRegrasCustom(regra.regras || []); };

  const handleSalvarRegra = async () => {
    if (!nomeRegra.trim()) return;
    const ok = await salvarRegra({ nome: nomeRegra.trim(), areas: filtroAreas, tipos_atividade: filtroTipos, atendentes: atendentesIds, modo, regras: regrasCustom });
    if (ok) { setShowSaveModal(false); setNomeRegra(""); }
  };

  const fieldClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none";

  return (
    <>
      <Header title="Distribuição" subtitle="Configure e distribua atividades entre atendentes" />
      <div className="page-anim flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5">
          {/* Resultado */}
          {resultado && (
            <div className="rounded-xl bg-success-50 border border-success-200 px-4 py-3 flex items-center gap-3 animate-fade-in">
              <FaCheckCircle className="text-success-600 shrink-0" />
              <span className="text-sm font-semibold text-success-700">
                {resultado.distributed} atividade(s) distribuída(s)!{resultado.erros > 0 && ` (${resultado.erros} erro(s))`}
              </span>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-danger-50 border border-danger-200 px-4 py-3 text-sm text-danger-700 font-medium">{error}</div>
          )}

          <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
            {/* Configuração */}
            <div className="space-y-5">
              {/* Filtros de Área */}
              <div className="rounded-2xl bg-white border border-slate-200 shadow-card p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Filtrar por Área</h3>
                <div className="flex flex-wrap gap-2">
                  {(areas || []).map((area) => (
                    <button key={area} onClick={() => toggleArea(area)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${filtroAreas.includes(area) ? "bg-slate-900 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                      {area}
                    </button>
                  ))}
                  {(!areas || areas.length === 0) && <p className="text-xs text-slate-400">Nenhuma área disponível</p>}
                </div>
              </div>

              {/* Filtros de Tipo */}
              <div className="rounded-2xl bg-white border border-slate-200 shadow-card p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Filtrar por Tipo</h3>
                <div className="flex flex-wrap gap-2">
                  {(tipos || []).map((tipo) => (
                    <button key={tipo} onClick={() => toggleTipo(tipo)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${filtroTipos.includes(tipo) ? "bg-slate-900 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                      {tipo}
                    </button>
                  ))}
                  {(!tipos || tipos.length === 0) && <p className="text-xs text-slate-400">Nenhum tipo disponível</p>}
                </div>
              </div>

              {/* Atendentes */}
              <div className="rounded-2xl bg-white border border-slate-200 shadow-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Atendentes</h3>
                  <button onClick={toggleAllAtendentes} className="text-xs font-semibold text-primary hover:text-primary-600 transition">
                    {atendentesIds.length === atendentes.length ? "Desmarcar todos" : "Selecionar todos"}
                  </button>
                </div>
                <div className="space-y-1.5 max-h-[240px] overflow-y-auto">
                  {(atendentes || []).map((at) => (
                    <label key={at.id} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-all duration-150 ${atendentesIds.includes(at.id) ? "bg-primary-50/50 border border-primary-200/60" : "hover:bg-slate-50 border border-transparent"}`}>
                      <input type="checkbox" checked={atendentesIds.includes(at.id)} onChange={() => toggleAtendente(at.id)} className="rounded border-slate-300 text-primary focus:ring-primary/20" />
                      <span className="text-sm font-medium text-slate-700">{at.nome}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Modo */}
              <div className="rounded-2xl bg-white border border-slate-200 shadow-card p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Modo de Distribuição</h3>
                <div className="space-y-2">
                  {[
                    { value: "igualitario", label: "Igualitário", desc: "Divide igual entre todos" },
                    { value: "quantidade", label: "Quantidade fixa", desc: "Defina quantidade por atendente" },
                    { value: "percentual", label: "Percentual", desc: "Defina % por atendente" },
                  ].map((m) => (
                    <label key={m.value} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-all duration-150 ${modo === m.value ? "bg-primary-50/50 border border-primary-200/60" : "hover:bg-slate-50 border border-transparent"}`}>
                      <input type="radio" name="modo" value={m.value} checked={modo === m.value} onChange={(e) => setModo(e.target.value)} className="border-slate-300 text-primary focus:ring-primary/20" />
                      <div>
                        <span className="text-sm font-medium text-slate-800">{m.label}</span>
                        <p className="text-2xs text-slate-400">{m.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Regras custom */}
              {modo !== "igualitario" && atendentesIds.length > 0 && (
                <div className="rounded-2xl bg-white border border-slate-200 shadow-card p-5 animate-fade-in">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    {modo === "quantidade" ? "Quantidade por Atendente" : "Percentual por Atendente"}
                  </h3>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {atendentesIds.map((id) => {
                      const at = atendentes.find((a) => a.id === id);
                      const regra = regrasCustom.find((r) => r.atendente_id === id);
                      return (
                        <div key={id} className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
                          <span className="text-sm font-medium text-slate-700 flex-1 truncate">{at?.nome}</span>
                          <input type="number" min="0" value={modo === "quantidade" ? (regra?.quantidade || "") : (regra?.percentual || "")} onChange={(e) => atualizarRegra(id, modo === "quantidade" ? "quantidade" : "percentual", Number(e.target.value))} placeholder={modo === "quantidade" ? "Qtd" : "%"} className="w-20 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-right tabular-nums outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
                          {modo === "percentual" && <span className="text-xs text-slate-400">%</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Ações */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <button onClick={handlePreview} disabled={loading || agendamentosFiltrados.length === 0 || atendentesIds.length === 0} className="flex-1 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2">
                  <FaRandom size={14} /> Prévia
                </button>
                <button onClick={() => setShowSaveModal(true)} disabled={atendentesIds.length === 0} className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2">
                  <FaSave size={14} /> Salvar Regra
                </button>
              </div>
            </div>

            {/* Regras salvas */}
            <div className="rounded-2xl bg-white border border-slate-200 shadow-card p-5 h-fit">
              <button onClick={() => setShowRegras(!showRegras)} className="flex items-center justify-between w-full">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Regras Salvas</h3>
                {showRegras ? <FaChevronUp size={12} className="text-slate-400" /> : <FaChevronDown size={12} className="text-slate-400" />}
              </button>
              {showRegras && (
                <div className="mt-3 space-y-2">
                  {(!regras || regras.length === 0) ? (
                    <p className="text-xs text-slate-400 text-center py-4">Nenhuma regra salva</p>
                  ) : regras.map((regra) => (
                    <div key={regra.id} className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-slate-800">{regra.nome}</span>
                        <button onClick={() => deletarRegra(regra.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-danger hover:bg-danger-50 transition" title="Excluir">
                          <FaTrash size={12} />
                        </button>
                      </div>
                      <div className="flex gap-1.5 flex-wrap mb-2">
                        {(regra.areas || []).map((a) => <span key={a} className="rounded bg-slate-200 px-2 py-0.5 text-2xs font-medium text-slate-600">{a}</span>)}
                        {(regra.tipos_atividade || []).map((t) => <span key={t} className="rounded bg-primary-50 px-2 py-0.5 text-2xs font-medium text-primary-600">{t}</span>)}
                      </div>
                      <button onClick={() => aplicarRegra(regra)} className="w-full rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition">
                        Aplicar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <DistributionPreview preview={preview} onConfirm={handleConfirm} onCancel={() => setPreview(null)} executing={executing} />

      {/* Salvar Regra Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4" onClick={() => setShowSaveModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Salvar Regra</h3>
            <label className="block">
              <span className="text-sm font-medium text-slate-700 mb-1.5 block">Nome da Regra</span>
              <input type="text" value={nomeRegra} onChange={(e) => setNomeRegra(e.target.value)} placeholder="Ex: Reparos SP2 - Manhã" className={fieldClass} autoFocus />
            </label>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setShowSaveModal(false)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all duration-200">Cancelar</button>
              <button onClick={handleSalvarRegra} disabled={!nomeRegra.trim()} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-all duration-200 disabled:opacity-50 active:scale-[0.98]">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
