import { useEffect, useState } from "react";
import { FaRandom, FaSave, FaTrash, FaCheckCircle } from "react-icons/fa";
import { useDistribuicao } from "../hooks/useDistribuicao";
import DistributionPreview from "../components/DistributionPreview";

export default function Distribuicao() {
  const {
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
  } = useDistribuicao();

  // Filtros
  const [filtroAreas, setFiltroAreas] = useState([]);
  const [filtroTipos, setFiltroTipos] = useState([]);
  const [atendentesIds, setAtendentesIds] = useState([]);
  const [modo, setModo] = useState("igualitario");
  const [regrasCustom, setRegrasCustom] = useState([]);
  const [nomeRegra, setNomeRegra] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    loadAgendamentos();
    loadAtendentes();
    loadRegras();
  }, [loadAgendamentos, loadAtendentes, loadRegras]);

  const agendamentosFiltrados = filtrarAgendamentos({ areas: filtroAreas, tipos: filtroTipos });

  // Toggle área
  const toggleArea = (area) => {
    setFiltroAreas((prev) => prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]);
  };

  // Toggle tipo
  const toggleTipo = (tipo) => {
    setFiltroTipos((prev) => prev.includes(tipo) ? prev.filter((t) => t !== tipo) : [...prev, tipo]);
  };

  // Toggle atendente
  const toggleAtendente = (id) => {
    setAtendentesIds((prev) => {
      const next = prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id];
      // Limpar regras custom quando mudar atendentes
      setRegrasCustom((prev) => prev.filter((r) => next.includes(r.atendente_id)));
      return next;
    });
  };

  // Selecionar/desselecionar todos atendentes
  const toggleAllAtendentes = () => {
    if (atendentesIds.length === atendentes.length) {
      setAtendentesIds([]);
      setRegrasCustom([]);
    } else {
      setAtendentesIds(atendentes.map((a) => a.id));
    }
  };

  // Atualizar regra custom de um atendente
  const atualizarRegra = (atendenteId, campo, valor) => {
    setRegrasCustom((prev) => {
      const existente = prev.find((r) => r.atendente_id === atendenteId);
      if (existente) {
        return prev.map((r) => r.atendente_id === atendenteId ? { ...r, [campo]: valor } : r);
      }
      return [...prev, { atendente_id: atendenteId, [campo]: valor }];
    });
  };

  // Gerar preview
  const handlePreview = () => {
    calcularPreview(agendamentosFiltrados, atendentesIds, modo, regrasCustom);
  };

  // Confirmar distribuição
  const handleConfirm = async () => {
    const result = await executarDistribuicao(agendamentosFiltrados, preview.distribuicao, null);
    if (result) {
      setResultado(result);
      setTimeout(() => setResultado(null), 5000);
    }
  };

  // Aplicar regra salva
  const aplicarRegra = (regra) => {
    setFiltroAreas(regra.areas || []);
    setFiltroTipos(regra.tipos_atividade || []);
    setAtendentesIds(regra.atendentes || []);
    setModo(regra.modo || "igualitario");
    setRegrasCustom(regra.regras || []);
  };

  // Salvar regra
  const handleSalvarRegra = async () => {
    if (!nomeRegra.trim()) return;
    const ok = await salvarRegra({
      nome: nomeRegra.trim(),
      areas: filtroAreas,
      tipos_atividade: filtroTipos,
      atendentes: atendentesIds,
      modo,
      regras: regrasCustom,
    });
    if (ok) {
      setShowSaveModal(false);
      setNomeRegra("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Distribuição de Atividades</h1>
          <p className="text-sm text-slate-500 mt-1">Configure e distribua atividades entre atendentes</p>
        </div>
        <button
          onClick={() => { loadAgendamentos(); }}
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Atualizar
        </button>
      </div>

      {/* Resultado */}
      {resultado && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3">
          <FaCheckCircle className="text-emerald-600" />
          <span className="text-sm font-medium text-emerald-800">
            {resultado.distributed} atividade(s) distribuída(s) com sucesso!
            {resultado.erros > 0 && ` (${resultado.erros} erro(s))`}
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4">
          <p className="text-sm font-medium text-rose-800">{error}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna 1: Filtros */}
        <div className="space-y-5">
          {/* Filtro por Área */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Filtrar por Área</h3>
            <div className="flex flex-wrap gap-2">
              {areas.map((area) => (
                <button
                  key={area}
                  onClick={() => toggleArea(area)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    filtroAreas.includes(area)
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {area}
                </button>
              ))}
              {filtroAreas.length > 0 && (
                <button
                  onClick={() => setFiltroAreas([])}
                  className="rounded-full px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-700"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          {/* Filtro por Tipo */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Filtrar por Tipo</h3>
            <div className="flex flex-wrap gap-2">
              {tipos.map((tipo) => (
                <button
                  key={tipo}
                  onClick={() => toggleTipo(tipo)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    filtroTipos.includes(tipo)
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {tipo}
                </button>
              ))}
              {filtroTipos.length > 0 && (
                <button
                  onClick={() => setFiltroTipos([])}
                  className="rounded-full px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-700"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          {/* Contador */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center">
            <span className="text-3xl font-extrabold text-slate-900">{agendamentosFiltrados.length}</span>
            <p className="text-sm text-slate-500 mt-1">atividade(s) encontrada(s)</p>
          </div>

          {/* Regras salvas */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Regras Salvas</h3>
            {regras.length === 0 ? (
              <p className="text-xs text-slate-400">Nenhuma regra salva</p>
            ) : (
              <div className="space-y-2">
                {regras.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                    <button
                      onClick={() => aplicarRegra(r)}
                      className="text-sm font-medium text-slate-700 hover:text-slate-900 text-left truncate flex-1"
                      title={`Aplicar regra: ${r.nome}`}
                    >
                      {r.nome}
                    </button>
                    <button
                      onClick={() => deletarRegra(r.id)}
                      className="ml-2 text-slate-400 hover:text-rose-600 transition"
                      title="Excluir regra"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Coluna 2: Atendentes */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700">Atendentes</h3>
            <button
              onClick={toggleAllAtendentes}
              className="text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              {atendentesIds.length === atendentes.length ? "Desmarcar todos" : "Selecionar todos"}
            </button>
          </div>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {atendentes.map((at) => (
              <label
                key={at.id}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition ${
                  atendentesIds.includes(at.id) ? "bg-slate-100" : "hover:bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={atendentesIds.includes(at.id)}
                  onChange={() => toggleAtendente(at.id)}
                  className="rounded cursor-pointer"
                />
                <span className="text-sm font-medium text-slate-800">{at.nome}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Coluna 3: Modo de Distribuição */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Modo de Distribuição</h3>
            <div className="space-y-2">
              {[
                { value: "igualitario", label: "Igualitário", desc: "Divide igualmente entre todos" },
                { value: "quantidade", label: "Quantidade Fixa", desc: "Cada atendente recebe X atividades" },
                { value: "percentual", label: "Percentual", desc: "Cada atendente recebe X% das atividades" },
              ].map((m) => (
                <label
                  key={m.value}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 cursor-pointer transition ${
                    modo === m.value ? "bg-slate-100 border border-slate-300" : "hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  <input
                    type="radio"
                    name="modo"
                    value={m.value}
                    checked={modo === m.value}
                    onChange={() => setModo(m.value)}
                    className="cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-medium text-slate-800">{m.label}</span>
                    <p className="text-xs text-slate-500">{m.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Regras custom quando modo != igualitario */}
          {modo !== "igualitario" && atendentesIds.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                {modo === "quantidade" ? "Quantidade por Atendente" : "Percentual por Atendente"}
              </h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {atendentesIds.map((id) => {
                  const at = atendentes.find((a) => a.id === id);
                  const regra = regrasCustom.find((r) => r.atendente_id === id);
                  return (
                    <div key={id} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2">
                      <span className="text-sm font-medium text-slate-800 flex-1 truncate">{at?.nome}</span>
                      <input
                        type="number"
                        min="0"
                        value={modo === "quantidade" ? (regra?.quantidade || "") : (regra?.percentual || "")}
                        onChange={(e) => atualizarRegra(id, modo === "quantidade" ? "quantidade" : "percentual", Number(e.target.value))}
                        placeholder={modo === "quantidade" ? "Qtd" : "%"}
                        className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-right outline-none focus:border-slate-400"
                      />
                      {modo === "percentual" && <span className="text-xs text-slate-400">%</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Botões de ação */}
          <div className="space-y-3">
            <button
              onClick={handlePreview}
              disabled={loading || agendamentosFiltrados.length === 0 || atendentesIds.length === 0}
              className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <FaRandom /> Visualizar Prévia
            </button>
            <button
              onClick={() => setShowSaveModal(true)}
              disabled={atendentesIds.length === 0}
              className="w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FaSave /> Salvar como Regra
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Preview */}
      <DistributionPreview
        preview={preview}
        onConfirm={handleConfirm}
        onCancel={() => setPreview(null)}
        executing={executing}
      />

      {/* Modal Salvar Regra */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowSaveModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Salvar Regra de Distribuição</h3>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Nome da Regra</span>
              <input
                type="text"
                value={nomeRegra}
                onChange={(e) => setNomeRegra(e.target.value)}
                placeholder="Ex: Reparos SP2 - Turno Manhã"
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                autoFocus
              />
            </label>
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setShowSaveModal(false)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarRegra}
                disabled={!nomeRegra.trim()}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
