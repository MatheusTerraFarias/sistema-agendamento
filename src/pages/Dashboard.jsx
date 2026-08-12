import { useEffect, useMemo } from "react";
import { FaCalendarAlt, FaCheckCircle, FaClock, FaTimesCircle, FaPlus, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAgendamentosContext } from "../hooks/useAgendamentosContext";
import { StatCard } from "../components/ui/Card";
import Card from "../components/ui/Card";
import Header from "../components/layout/Header";

const STATUS_CONFIG = {
  confirmado: { label: "Confirmado", color: "text-success-600", bg: "bg-success-50", bar: "bg-success-500" },
  concluido: { label: "Concluido", color: "text-primary-600", bg: "bg-primary-50", bar: "bg-primary-500" },
  normalizado: { label: "Normalizado", color: "text-slate-600", bg: "bg-slate-100", bar: "bg-slate-400" },
  mensagem: { label: "Mensagem", color: "text-warning-600", bg: "bg-warning-50", bar: "bg-warning-400" },
  sem_contato: { label: "Sem contato", color: "text-danger", bg: "bg-danger-50", bar: "bg-danger-400" },
  tratar_os: { label: "Tratar OS", color: "text-orange-600", bg: "bg-orange-50", bar: "bg-orange-400" },
  outra_area: { label: "Outra area", color: "text-purple-600", bg: "bg-purple-50", bar: "bg-purple-400" },
  outros: { label: "Outros", color: "text-slate-600", bg: "bg-slate-100", bar: "bg-slate-400" },
};

const BADGE_CLASS = {
  confirmado: "bg-success-50 text-success-700 ring-1 ring-success-200",
  concluido: "bg-primary-50 text-primary-700 ring-1 ring-primary-200",
  normalizado: "bg-slate-100 text-slate-700 ring-1 ring-slate-300",
  mensagem: "bg-warning-50 text-warning-700 ring-1 ring-warning-200",
  sem_contato: "bg-danger-50 text-danger-700 ring-1 ring-danger-200",
  tratar_os: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
  outra_area: "bg-purple-50 text-purple-700 ring-1 ring-purple-200",
  outros: "bg-slate-100 text-slate-600 ring-1 ring-slate-300",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { session, profile, agendamentos, loading, loadAll } = useAgendamentosContext();

  useEffect(() => {
    if (!session) return;
    loadAll();
  }, [session, loadAll]);

  const stats = useMemo(() => ({
    total: agendamentos.length,
    confirmado: agendamentos.filter((a) => a.status === "confirmado").length,
    tratar_os: agendamentos.filter((a) => a.status === "tratar_os").length,
    concluido: agendamentos.filter((a) => a.status === "concluido").length,
    mensagem: agendamentos.filter((a) => a.status === "mensagem").length,
    sem_contato: agendamentos.filter((a) => a.status === "sem_contato").length,
  }), [agendamentos]);

  const recentAgendamentos = useMemo(
    () =>
      agendamentos.slice(0, 6).map((a) => ({
        ...a,
        cliente_nome: a.cliente_nome || "Desconhecido",
      })),
    [agendamentos]
  );

  const quickActions = [
    { label: "Novo Agendamento", icon: FaPlus, to: "/agendamentos", color: "from-primary to-primary-600" },
    { label: "Importar XLSX", icon: FaCalendarAlt, to: "/importar", color: "from-success-500 to-success-700" },
  ];

  return (
    <>
      <Header title="Dashboard" subtitle="Bem-vindo ao Sistema de Agendamento" session={session} profile={profile} />
      <div className="page-anim flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard label="Total" value={loading ? "-" : stats.total} icon={<FaCalendarAlt size={18} />} iconColor="text-primary" trend="Todos os chamados" />
            <StatCard label="Confirmados" value={loading ? "-" : stats.confirmado} icon={<FaCheckCircle size={18} />} iconColor="text-success-600" trend="Prontos para agendar" />
            <StatCard label="Tratar OS" value={loading ? "-" : stats.tratar_os} icon={<FaClock size={18} />} iconColor="text-orange-500" trend="Pendentes de acao" />
            <StatCard label="Mensagem" value={loading ? "-" : stats.mensagem} icon={<FaTimesCircle size={18} />} iconColor="text-warning-600" trend="Aguardando resposta" />
            <StatCard label="Sem contato" value={loading ? "-" : stats.sem_contato} icon={<FaTimesCircle size={18} />} iconColor="text-danger" trend="Nao foi possivel" />
          </div>
          {/* Distribuicao por status + recentes */}
          <div className="grid gap-6 lg:grid-cols-4">
            <Card className="lg:col-span-1">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Distribuicao por status</h2>
              </div>
              {loading ? (
                <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-9 rounded-xl" />)}</div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                    const count = stats[key] || 0;
                    const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold text-slate-600">{cfg.label}</span>
                          <span className="text-xs font-bold text-slate-800">{count}</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div className={`h-full rounded-full ${cfg.bar}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card className="lg:col-span-3">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Agendamentos Recentes</h2>
                <button onClick={() => navigate("/agendamentos")} className="text-xs font-semibold text-primary hover:text-primary-600 transition-colors flex items-center gap-1">
                  Ver todos <FaArrowRight size={10} />
                </button>
              </div>
              {loading ? (
                <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
              ) : recentAgendamentos.length > 0 ? (
                <div className="space-y-2">
                  {recentAgendamentos.map((ag) => (
                    <div key={ag.id} onClick={() => navigate("/agendamentos")} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-all duration-200 cursor-pointer group">
                      <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 group-hover:bg-primary-50 group-hover:text-primary transition-colors shrink-0">
                        {ag.cliente_nome?.charAt(0) || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{ag.cliente_nome}</p>
                        <p className="text-2xs text-slate-400">{new Date(ag.created_at).toLocaleDateString("pt-BR")} . {ag.hora_agendamento || "-"}</p>
                      </div>
                      <span className={`inline-flex shrink-0 rounded-lg px-2.5 py-1 text-2xs font-bold ${BADGE_CLASS[ag.status] || "bg-slate-100 text-slate-600"}`}>
                        {STATUS_CONFIG[ag.status]?.label || ag.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-8">Nenhum agendamento encontrado</p>
              )}
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-3 sm:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button key={action.label} onClick={() => navigate(action.to)} className={`group flex items-center gap-3 rounded-2xl bg-gradient-to-r ${action.color} px-5 py-4 text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]`}>
                  <Icon size={16} className="opacity-80" />
                  {action.label}
                  <FaArrowRight size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}