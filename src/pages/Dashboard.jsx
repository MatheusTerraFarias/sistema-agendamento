import { useEffect, useMemo } from "react";
import { FaUsers, FaCalendarAlt, FaCheckCircle, FaClock, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAgendamentos } from "../hooks/useAgendamentos";
import Card from "../components/ui/Card";

export default function Dashboard() {
  const navigate = useNavigate();
  const { session, agendamentos, clientes, loading, loadAll } = useAgendamentos();

  useEffect(() => {
    if (!session) return;
    loadAll();
  }, [session, loadAll]);

  const stats = useMemo(
    () => ({
      total: agendamentos.length,
      novo: agendamentos.filter((a) => a.status === "novo").length,
      em_andamento: agendamentos.filter((a) => a.status === "em_andamento").length,
      finalizado: agendamentos.filter((a) => a.status === "finalizado").length,
    }),
    [agendamentos]
  );

  const statusDistribution = useMemo(() => {
    return {
      novo: agendamentos.filter((a) => a.status === "novo").length,
      em_andamento: agendamentos.filter((a) => a.status === "em_andamento").length,
      finalizado: agendamentos.filter((a) => a.status === "finalizado").length,
      cancelado: agendamentos.filter((a) => a.status === "cancelado").length,
    };
  }, [agendamentos]);

  const recentAgendamentos = useMemo(
    () => agendamentos.slice(0, 5).map((a) => ({
      ...a,
      cliente_nome: clientes.find((c) => c.id === a.cliente_id)?.nome || "Desconhecido",
    })),
    [agendamentos, clientes]
  );

  const quickActions = [
    { label: "Novo Agendamento", icon: FaPlus, action: () => navigate("/agendamentos") },
    { label: "Ver Clientes", icon: FaUsers, action: () => navigate("/clientes") },
    { label: "Importar XLSX", icon: FaCalendarAlt, action: () => navigate("/importar") },
  ];

  return (
    <div className="page-anim space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-600">Bem-vindo ao Sistema de Agendamento. Aqui está um resumo da sua operação.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm uppercase tracking-widest text-slate-500 font-semibold">Total Agendamentos</p>
              <p className="mt-3 text-3xl font-bold text-slate-900">{loading ? "-" : stats.total}</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600">
              <FaCalendarAlt size={20} />
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-600">Todos os chamados registrados</p>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm uppercase tracking-widest text-slate-500 font-semibold">Novos</p>
              <p className="mt-3 text-3xl font-bold text-sky-600">{loading ? "-" : stats.novo}</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600">
              <FaClock size={20} />
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-600">Aguardando atendimento</p>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm uppercase tracking-widest text-slate-500 font-semibold">Em Andamento</p>
              <p className="mt-3 text-3xl font-bold text-amber-600">{loading ? "-" : stats.em_andamento}</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
              <FaClock size={20} />
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-600">Sendo atendidos agora</p>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm uppercase tracking-widest text-slate-500 font-semibold">Finalizados</p>
              <p className="mt-3 text-3xl font-bold text-emerald-600">{loading ? "-" : stats.finalizado}</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
              <FaCheckCircle size={20} />
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-600">Concluídos com sucesso</p>
        </Card>
      </div>

      {/* Status Distribution & Recent */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status Breakdown */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-slate-900">Distribuição por Status</h2>
          <div className="mt-6 space-y-4">
            {[
              { status: "novo", label: "Novo", color: "text-sky-600", bgColor: "bg-sky-50", count: statusDistribution.novo },
              { status: "em_andamento", label: "Em Andamento", color: "text-amber-600", bgColor: "bg-amber-50", count: statusDistribution.em_andamento },
              { status: "finalizado", label: "Finalizado", color: "text-emerald-600", bgColor: "bg-emerald-50", count: statusDistribution.finalizado },
              { status: "cancelado", label: "Cancelado", color: "text-rose-600", bgColor: "bg-rose-50", count: statusDistribution.cancelado },
            ].map((item) => (
              <div key={item.status}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                  <span className={`text-lg font-bold ${item.color}`}>{item.count}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full transition-all ${item.bgColor}`}
                    style={{ width: `${stats.total > 0 ? (item.count / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Agendamentos */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-slate-900">Agendamentos Recentes</h2>
          <div className="mt-6 space-y-3">
            {loading ? (
              <p className="text-slate-500 text-sm">Carregando...</p>
            ) : recentAgendamentos.length > 0 ? (
              recentAgendamentos.map((agendamento) => (
                <div key={agendamento.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition cursor-pointer" onClick={() => navigate("/agendamentos")}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{agendamento.cliente_nome}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(agendamento.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    agendamento.status === "novo"
                      ? "bg-sky-100 text-sky-800"
                      : agendamento.status === "em_andamento"
                      ? "bg-amber-100 text-amber-800"
                      : agendamento.status === "finalizado"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}>
                    {agendamento.status === "novo"
                      ? "Novo"
                      : agendamento.status === "em_andamento"
                      ? "Em andamento"
                      : agendamento.status === "finalizado"
                      ? "Finalizado"
                      : "Cancelado"}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-sm">Nenhum agendamento encontrado</p>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Ações Rápidas</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={action.action}
                className="flex items-center justify-center gap-2 rounded-lg border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary hover:bg-primary/5 active:scale-95"
              >
                <Icon size={16} />
                {action.label}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Info Section */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary-600/10 border border-primary/20">
        <h2 className="text-lg font-bold text-primary">📊 Dica</h2>
        <p className="mt-2 text-sm text-primary-900">
          Mantenha seus agendamentos organizados e em dia. Use a importação XLSX para atualizar múltiplos registros de uma vez.
        </p>
      </Card>
    </div>
  );
}