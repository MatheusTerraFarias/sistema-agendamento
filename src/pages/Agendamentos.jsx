import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { FaPlus, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import { useAgendamentos } from "../hooks/useAgendamentos";
import AgendamentoForm from "../components/AgendamentoForm";
import AgendamentosTable from "../components/AgendamentosTable";
import ReatribuirModal from "../components/ReatribuirModal";

const FILTERS = [
  { key: "todos", label: "Todos" },
  { key: "novo", label: "Novos" },
  { key: "em_andamento", label: "Em andamento" },
  { key: "finalizado", label: "Finalizados" },
  { key: "cancelado", label: "Cancelados" },
];

export default function Agendamentos() {
  const navigate = useNavigate();
  const {
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
    createAgendamento,
    updateAgendamento,
    cancelAgendamento,
    cancelAgendamentos,
    reatribuirAgendamento,
    reatribuirAgendamentos,
  } = useAgendamentos();

  const [filter, setFilter] = useState("todos");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [reatribuirData, setReatribuirData] = useState(null);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (!session) return;
    const timeout = setTimeout(() => {
      loadAll(filter, search);
    }, 400);
    return () => clearTimeout(timeout);
  }, [session, filter, search, loadAll]);

  const clienteMap = useMemo(
    () => new Map(clientes.map((item) => [item.id, item])),
    [clientes]
  );

  const servicoMap = useMemo(
    () => new Map(servicos.map((item) => [item.id, item])),
    [servicos]
  );

  const atendenteMap = useMemo(
    () => new Map(atendentes.map((item) => [item.id, item])),
    [atendentes]
  );

  const enrichedAgendamentos = useMemo(
    () =>
      agendamentos.map((item) => {
        const cliente = clienteMap.get(item.cliente_id);
        const servico = servicoMap.get(item.servico_id);
        const atendente = atendenteMap.get(item.criado_por) || atendenteMap.get(item.distribuido_para);

        return {
          ...item,
          cliente_nome: cliente?.nome || "Cliente não encontrado",
          telefone: cliente?.telefone || "-",
          servico_nome: servico?.nome || "-",
          atendente_nome: atendente?.nome || "-",
        };
      }),
    [agendamentos, clienteMap, servicoMap, atendenteMap]
  );

  const counts = useMemo(() => {
    const summary = { todos: 0, novo: 0, em_andamento: 0, finalizado: 0, cancelado: 0 };
    agendamentos.forEach((item) => {
      summary.todos += 1;
      if (item.status && summary[item.status] !== undefined) {
        summary[item.status] += 1;
      }
    });
    return summary;
  }, [agendamentos]);

  function handleCreate() {
    setEditData(null);
    setModalOpen(true);
  }

  async function handleSubmit(values) {
    try {
      if (editData) {
        await updateAgendamento(editData.id, values);
        setFeedback({ type: "success", message: "Agendamento atualizado." });
      } else {
        await createAgendamento(values);
        setFeedback({ type: "success", message: "Agendamento criado e distribuído." });
      }
      setModalOpen(false);
      setEditData(null);
    } catch (err) {
      setFeedback({ type: "error", message: err?.message || "Falha ao salvar." });
    }
  }

  async function handleCancel(id) {
    await cancelAgendamento(id);
    setFeedback({ type: "success", message: "Agendamento cancelado." });
  }

  async function handleBulkAction(action, ids) {
    if (action !== "cancel" || !ids?.length) return;
    await cancelAgendamentos(ids);
    setFeedback({ type: "success", message: `${ids.length} agendamento(s) cancelado(s).` });
  }

  async function handleReatribuir(id, atendenteId, motivo) {
    await reatribuirAgendamento(id, atendenteId, motivo);
    setFeedback({ type: "success", message: "Atendimento reatribuído." });
    setReatribuirData(null);
  }

  function handleBulkReatribuir(ids) {
    const selected = enrichedAgendamentos.filter((item) => ids.includes(item.id));
    setReatribuirData({ bulk: true, items: selected });
  }

  async function handleBulkReatribuirSubmit(ids, atendenteId, motivo) {
    await reatribuirAgendamentos(ids, atendenteId, motivo);
    setFeedback({ type: "success", message: `${ids.length} agendamento(s) reatribuído(s).` });
    setReatribuirData(null);
  }

  const currentUserName = profile?.nome || "Usuário";

  return (
    <div className="page-anim min-h-full w-full min-w-0 max-w-full bg-slate-100 py-6 sm:py-8">
      <div className="mx-auto w-full min-w-0 max-w-7xl px-0 sm:px-4">
        <div className="mb-6 flex min-w-0 flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold text-slate-900">Agendamentos</h1>
            <p className="text-slate-600 mt-2">Bem-vindo, {currentUserName}. Gerencie seus chamados com rapidez.</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Button onClick={handleCreate} variant="primary">
              <FaPlus /> Novo agendamento
            </Button>
            <Button onClick={() => navigate("/dashboard")} variant="ghost">
              Voltar ao painel
            </Button>
          </div>
        </div>

        {feedback ? (
          <div
            className={`rounded-2xl px-4 py-3 text-sm font-medium ${
              feedback.type === "success"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-rose-100 text-rose-800"
            } mb-6`}
          >
            {feedback.message}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-4 mb-6">
          <Card>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Total</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{counts.todos}</p>
          </Card>
          <Card>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Novos</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{counts.novo}</p>
          </Card>
          <Card>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Em andamento</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{counts.em_andamento}</p>
          </Card>
          <Card>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Finalizados</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{counts.finalizado}</p>
          </Card>
        </div>

        <div className="w-full min-w-0 rounded-3xl bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-6 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              {FILTERS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFilter(item.key)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    filter === item.key
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="relative w-full max-w-sm">
              <Input
                icon={<FaSearch className="h-4 w-4" />}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                type="search"
                placeholder="Buscar por nome ou telefone"
              />
            </div>
          </div>
          <AgendamentosTable
            agendamentos={enrichedAgendamentos}
            loading={loading}
            onEdit={(item) => {
              setEditData(item);
              setModalOpen(true);
            }}
            onCancel={handleCancel}
            onReatribuir={(item) => setReatribuirData(item)}
            onBulkAction={handleBulkAction}
            onBulkReatribuir={handleBulkReatribuir}
            isSupervisor={isSupervisor}
          />
          {error ? <div className="mt-4 text-sm text-rose-600">{error}</div> : null}
        </div>
      </div>

      {modalOpen ? createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 px-4 py-4 sm:py-6">
          <div className="my-auto flex max-h-[calc(100dvh-2rem)] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)]">
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{editData ? "Editar agendamento" : "Novo agendamento"}</h2>
                <p className="text-sm text-slate-500">Preencha os dados do cliente para criar um chamado.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  setEditData(null);
                }}
                className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Fechar
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-4 sm:px-6">
              <AgendamentoForm
                key={editData?.id || "new"}
                initialData={editData}
                clientes={clientes}
                servicos={servicos}
                onSubmit={handleSubmit}
                onClose={() => {
                  setModalOpen(false);
                  setEditData(null);
                }}
                loading={loading}
              />
            </div>
          </div>
        </div>,
        document.body
      ) : null}

      {reatribuirData ? createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 px-4 py-4 sm:py-6">
          <div className="my-auto flex max-h-[calc(100dvh-2rem)] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)]">
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Reatribuir atendente</h2>
                <p className="text-sm text-slate-500">Escolha um novo atendente e registre o motivo.</p>
              </div>
              <button
                type="button"
                onClick={() => setReatribuirData(null)}
                className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Fechar
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-4 sm:px-6">
              <ReatribuirModal
                key={reatribuirData?.id || "reatribuir"}
                agendamento={reatribuirData}
                agendamentos={reatribuirData?.items || []}
                atendentes={atendentes}
                onSubmit={reatribuirData?.bulk ? handleBulkReatribuirSubmit : handleReatribuir}
                onClose={() => setReatribuirData(null)}
                loading={loading}
              />
            </div>
          </div>
        </div>,
        document.body
      ) : null}
    </div>
  );
}
