import { useEffect, useMemo } from "react";
import { useAgendamentos } from "../hooks/useAgendamentos";
import { StatCard } from "../components/ui/Card";
import Card from "../components/ui/Card";
import Header from "../components/layout/Header";
import { FaUsers, FaPhone, FaPhoneSlash, FaCalendarAlt } from "react-icons/fa";

export default function Clientes() {
  const { session, profile, clientes, agendamentos, loading, error, loadAll } = useAgendamentos();

  useEffect(() => {
    if (!session) return;
    loadAll();
  }, [session, loadAll]);

  const agendamentosPorCliente = useMemo(() => {
    const map = new Map();
    agendamentos.forEach((item) => {
      if (!item.cliente_id) return;
      map.set(item.cliente_id, (map.get(item.cliente_id) || 0) + 1);
    });
    return map;
  }, [agendamentos]);

  const stats = useMemo(() => ({
    total: clientes.length,
    comTelefone: clientes.filter((c) => c.telefone).length,
    semTelefone: clientes.filter((c) => !c.telefone).length,
    agendamentos: agendamentos.length,
  }), [clientes, agendamentos]);

  return (
    <>
      <Header title="Clientes" subtitle="Gerencie os clientes vinculados aos seus agendamentos" session={session} profile={profile} />
      <div className="page-anim flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total de clientes" value={loading ? "—" : stats.total} icon={<FaUsers size={18} />} iconColor="text-primary" />
            <StatCard label="Com telefone" value={loading ? "—" : stats.comTelefone} icon={<FaPhone size={18} />} iconColor="text-success-600" />
            <StatCard label="Sem telefone" value={loading ? "—" : stats.semTelefone} icon={<FaPhoneSlash size={18} />} iconColor="text-danger" />
            <StatCard label="Agendamentos" value={loading ? "—" : stats.agendamentos} icon={<FaCalendarAlt size={18} />} iconColor="text-warning-600" />
          </div>

          <Card>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5">Clientes cadastrados</h2>
            {error ? (
              <div className="rounded-xl bg-danger-50 border border-danger-200 px-4 py-3 text-sm text-danger-700">{error}</div>
            ) : loading ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}</div>
            ) : clientes.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Nenhum cliente encontrado. Importe uma base ou crie um novo agendamento.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full border-collapse text-sm">
                  <thead className="bg-slate-50/80 border-b border-slate-200">
                    <tr>
                      {["Nome", "Telefone", "Agendamentos"].map((h) => (
                        <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clientes.map((cliente) => (
                      <tr key={cliente.id} className="hover:bg-slate-50/80 transition-colors duration-150">
                        <td className="px-5 py-3.5 font-semibold text-slate-800">{cliente.nome}</td>
                        <td className="px-5 py-3.5 text-slate-500 tabular-nums">{cliente.telefone || "—"}</td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 tabular-nums">
                            {agendamentosPorCliente.get(cliente.id) || 0}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
