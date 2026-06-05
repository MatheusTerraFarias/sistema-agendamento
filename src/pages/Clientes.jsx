import { useEffect, useMemo } from "react";
import { useAgendamentos } from "../hooks/useAgendamentos";
import Card from "../components/ui/Card";

export default function Clientes() {
  const { session, clientes, agendamentos, loading, error, loadAll } = useAgendamentos();

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

  const stats = useMemo(
    () => ({
      total: clientes.length,
      comTelefone: clientes.filter((cliente) => cliente.telefone).length,
      semTelefone: clientes.filter((cliente) => !cliente.telefone).length,
      agendamentos: agendamentos.length,
    }),
    [clientes, agendamentos]
  );

  return (
    <div className="page-anim min-h-screen bg-slate-100 py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">Clientes</h1>
          <p className="mt-2 text-slate-600">
            Gerencie os clientes que estão vinculados aos seus agendamentos e veja os contatos mais ativos.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
          <Card>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Total de clientes</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{loading ? "..." : stats.total}</p>
          </Card>
          <Card>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Clientes com telefone</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{loading ? "..." : stats.comTelefone}</p>
          </Card>
          <Card>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Sem telefone</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{loading ? "..." : stats.semTelefone}</p>
          </Card>
          <Card>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Agendamentos totais</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{loading ? "..." : stats.agendamentos}</p>
          </Card>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Clientes cadastrados</h2>
          {error ? (
            <p className="text-rose-600">{error}</p>
          ) : loading ? (
            <p className="text-slate-500">Carregando clientes...</p>
          ) : clientes.length === 0 ? (
            <p className="text-slate-500">Nenhum cliente encontrado. Importe uma base ou crie um novo agendamento.</p>
          ) : (
            <div className="overflow-x-auto rounded-3xl border border-slate-200">
              <table className="min-w-full border-collapse bg-white text-left text-sm text-slate-900">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Nome</th>
                    <th className="px-6 py-4 font-semibold">Telefone</th>
                    <th className="px-6 py-4 font-semibold">Agendamentos</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((cliente) => (
                    <tr key={cliente.id} className="border-t border-slate-100 hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-medium text-slate-900">{cliente.nome}</td>
                      <td className="px-6 py-4 text-slate-600">{cliente.telefone || "—"}</td>
                      <td className="px-6 py-4 text-slate-700">{agendamentosPorCliente.get(cliente.id) || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
