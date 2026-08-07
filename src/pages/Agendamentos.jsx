import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { FaSearch } from "react-icons/fa";
import { useAgendamentos } from "../hooks/useAgendamentos";
import AgendamentoForm from "../components/AgendamentoForm";
import AgendamentosTable from "../components/AgendamentosTable";
import ReatribuirModal from "../components/ReatribuirModal";
import Header from "../components/layout/Header";
import Toast from "../components/Toast";

const FILTERS = [
  { key: "todos", label: "Todos" },
  { key: "novo", label: "Novos" },
  { key: "em_andamento", label: "Em andamento" },
  { key: "finalizado", label: "Finalizados" },
  { key: "cancelado", label: "Cancelados" },
];

export default function Agendamentos() {
  const {
    session, profile, agendamentos, atendentes, clientes, servicos,
    loading, error, isSupervisor, loadAll, createAgendamento, updateAgendamento,
    cancelAgendamento, cancelAgendamentos, reatribuirAgendamento, reatribuirAgendamentos,
  } = useAgendamentos();

  const [filter, setFilter] = useState("todos");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [reatribuirData, setReatribuirData] = useState(null);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (!session) return;
    const t = setTimeout(() => loadAll(filter, search), 400);
    return () => clearTimeout(t);
  }, [session, filter, search, loadAll]);

  const clienteMap = useMemo(() => new Map(clientes.map((c) => [c.id, c])), [clientes]);
  const servicoMap = useMemo(() => new Map(servicos.map((s) => [s.id, s])), [servicos]);
  const atendenteMap = useMemo(() => new Map(atendentes.map((a) => [a.id, a])), [atendentes]);

  const enrichedAgendamentos = useMemo(
    () => agendamentos.map((item) => ({
      ...item,
      cliente_nome: clienteMap.get(item.cliente_id)?.nome || "Cliente não encontrado",
      telefone: clienteMap.get(item.cliente_id)?.telefone || "—",
      servico_nome: servicoMap.get(item.servico_id)?.nome || "—",
      atendente_nome: atendenteMap.get(item.criado_por)?.nome || atendenteMap.get(item.distribuido_para)?.nome || "—",
    })),
    [agendamentos, clienteMap, servicoMap, atendenteMap]
  );

  const counts = useMemo(() => {
    const s = { todos: agendamentos.length, novo: 0, em_andamento: 0, finalizado: 0, cancelado: 0 };
    agendamentos.forEach((a) => { if (s[a.status] !== undefined) s[a.status]++; });
    return s;
  }, [agendamentos]);

  async function handleSubmit(values) {
    try {
      if (editData) { await updateAgendamento(editData.id, values); setFeedback({ type: "success", message: "Agendamento atualizado." }); }
      else { await createAgendamento(values); setFeedback({ type: "success", message: "Agendamento criado e distribuído." }); }
      setModalOpen(false); setEditData(null);
    } catch (err) { setFeedback({ type: "error", message: err?.message || "Falha ao salvar." }); }
  }

  async function handleCancel(id) { await cancelAgendamento(id); setFeedback({ type: "success", message: "Agendamento cancelado." }); }

  async function handleBulkAction(action, ids) {
    if (action !== "cancel" || !ids?.length) return;
    await cancelAgendamentos(ids);
    setFeedback({ type: "success", message: `${ids.length} agendamento(s) cancelado(s).` });
  }

  async function handleReatribuir(id, atendenteId, motivo) {
    await reatribuirAgendamento(id, atendenteId, motivo);
    setFeedback({ type: "success", message: "Atendimento reatribuído." }); setReatribuirData(null);
  }

  function handleBulkReatribuir(ids) {
    setReatribuirData({ bulk: true, items: enrichedAgendamentos.filter((a) => ids.includes(a.id)) });
  }

  async function handleBulkReatribuirSubmit(ids, atendenteId, motivo) {
    await reatribuirAgendamentos(ids, atendenteId, motivo);
    setFeedback({ type: "success", message: `${ids.length} agendamento(s) reatribuído(s).` }); setReatribuirData(null);
  }

  return (
    <>
      <Header title="Agendamentos" subtitle="Gerencie seus chamados com rapidez" session={session} profile={profile} />

      <div className="page-anim flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5">
          {/* Stats cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {FILTERS.slice(1).map((f) => (
              <button key={f.key} onClick={() => setFilter(f.key)} className={`rounded-xl px-4 py-3 text-left transition-all duration-200 border ${filter === f.key ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}>
                <p className={`text-2xs font-semibold uppercase tracking-wider ${filter === f.key ? "text-white/60" : "text-slate-400"}`}>{f.label}</p>
                <p className={`text-2xl font-bold mt-1 tabular-nums ${filter === f.key ? "text-white" : "text-slate-900"}`}>{loading ? "—" : counts[f.key] ?? 0}</p>
              </button>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex flex-wrap gap-1.5">
              {FILTERS.map((f) => (
                <button key={f.key} onClick={() => setFilter(f.key)} className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${filter === f.key ? "bg-slate-900 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                  {f.label}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-auto sm:ml-auto">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome ou telefone" className="w-full sm:w-72 rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none transition-all duration-200" aria-label="Buscar agendamentos" />
            </div>
          </div>

          {/* Table */}
          <AgendamentosTable agendamentos={enrichedAgendamentos} loading={loading} onEdit={(item) => { setEditData(item); setModalOpen(true); }} onCancel={handleCancel} onReatribuir={(item) => setReatribuirData(item)} onBulkAction={handleBulkAction} onBulkReatribuir={handleBulkReatribuir} isSupervisor={isSupervisor} />

          {error && <div className="rounded-xl bg-danger-50 border border-danger-200 px-4 py-3 text-sm text-danger-700 font-medium">{error}</div>}
        </div>
      </div>

      {/* Novo/Editar Modal */}
      {modalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => { setModalOpen(false); setEditData(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{editData ? "Editar agendamento" : "Novo agendamento"}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{editData ? "Altere os dados do chamado" : "Preencha os dados para criar um chamado"}</p>
              </div>
              <button onClick={() => { setModalOpen(false); setEditData(null); }} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition" aria-label="Fechar">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="overflow-y-auto p-6">
              <AgendamentoForm key={editData?.id || "new"} initialData={editData} clientes={clientes} servicos={servicos} onSubmit={handleSubmit} onClose={() => { setModalOpen(false); setEditData(null); }} loading={loading} />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Reatribuir Modal */}
      {reatribuirData && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setReatribuirData(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Reatribuir atendente</h2>
                <p className="text-xs text-slate-400 mt-0.5">Escolha um novo atendente e registre o motivo</p>
              </div>
              <button onClick={() => setReatribuirData(null)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition" aria-label="Fechar">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="overflow-y-auto p-6">
              <ReatribuirModal key={reatribuirData?.id || "bulk"} agendamento={reatribuirData} agendamentos={reatribuirData?.items || []} atendentes={atendentes} onSubmit={reatribuirData?.bulk ? handleBulkReatribuirSubmit : handleReatribuir} onClose={() => setReatribuirData(null)} loading={loading} />
            </div>
          </div>
        </div>,
        document.body
      )}

      {feedback && (
        <div className="fixed top-4 right-4 z-[100]"><Toast message={feedback.message} type={feedback.type} onClose={() => setFeedback(null)} /></div>
      )}
    </>
  );
}
