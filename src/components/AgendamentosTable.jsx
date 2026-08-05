import { useCallback, useMemo, useState } from "react";
import { FaEdit, FaExchangeAlt, FaTimesCircle } from "react-icons/fa";

const STATUS_BADGES = {
  novo: "bg-sky-100 text-sky-800",
  em_andamento: "bg-amber-100 text-amber-800",
  finalizado: "bg-emerald-100 text-emerald-800",
  cancelado: "bg-rose-100 text-rose-800",
};

function getStatusLabel(status) {
  switch (status) {
    case "novo":
      return "Novo";
    case "em_andamento":
      return "Em andamento";
    case "finalizado":
      return "Finalizado";
    case "cancelado":
      return "Cancelado";
    default:
      return "—";
  }
}

function SkeletonRow() {
  return (
    <tr className="border-t border-slate-100 animate-pulse">
      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-5" /></td>
      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-32" /></td>
      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20" /></td>
      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24" /></td>
      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20" /></td>
      <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded-full w-20" /></td>
      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-28" /></td>
      <td className="px-6 py-4"><div className="h-8 bg-slate-200 rounded w-16" /></td>
    </tr>
  );
}

export default function AgendamentosTable({
  agendamentos,
  loading,
  onEdit,
  onCancel,
  onReatribuir,
  isSupervisor,
  onBulkAction,
  onBulkReatribuir,
}) {
  const [selectedIds, setSelectedIds] = useState(new Set());

  const allSelected = useMemo(() => {
    return agendamentos.length > 0 && selectedIds.size === agendamentos.length;
  }, [agendamentos.length, selectedIds.size]);

  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(agendamentos.map((a) => a.id)));
    }
  }, [allSelected, agendamentos]);

  const toggleSelectRow = useCallback((id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  }, [selectedIds]);

  const handleBulkCancel = useCallback(() => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`Deseja cancelar ${selectedIds.size} agendamento(s)?`)) {
      onBulkAction?.("cancel", Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  }, [selectedIds, onBulkAction]);

  const handleBulkReatribuir = useCallback(() => {
    if (!selectedIds.size) return;
    onBulkReatribuir?.(Array.from(selectedIds));
  }, [selectedIds, onBulkReatribuir]);

  if (loading) {
    return (
      <div className="w-full min-w-0 max-w-full overflow-x-auto rounded-3xl border border-slate-200">
        <table className="w-full min-w-[1020px] border-collapse bg-white text-left text-sm text-slate-900">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-6 py-4 font-semibold w-12">
                <input type="checkbox" disabled className="rounded" />
              </th>
              <th className="px-6 py-4 font-semibold">Cliente</th>
              <th className="px-6 py-4 font-semibold">Telefone</th>
              <th className="px-6 py-4 font-semibold">Data</th>
              <th className="px-6 py-4 font-semibold">Hora</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Bairro</th>
              <th className="px-6 py-4 font-semibold">Atendente</th>
              <th className="px-6 py-4 font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (agendamentos.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-slate-300 p-12 text-center">
        <p className="text-slate-600 font-medium">Nenhum agendamento encontrado</p>
        <p className="text-slate-500 text-sm mt-1">Crie um novo agendamento ou ajuste seus filtros</p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-full space-y-4">
      {selectedIds.size > 0 && (
        <div className="flex w-full min-w-0 flex-col gap-3 rounded-lg border border-sky-200 bg-sky-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-medium text-sky-800">{selectedIds.size} agendamento(s) selecionado(s)</span>
          <div className="flex flex-wrap gap-2">
            {isSupervisor ? (
              <button onClick={handleBulkReatribuir} className="inline-flex items-center gap-2 rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-800 active:scale-95">
                <FaExchangeAlt /> Reatribuir selecionados
              </button>
            ) : null}
            <button onClick={handleBulkCancel} className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 active:scale-95">
              <FaTimesCircle /> Cancelar selecionados
            </button>
          </div>
        </div>
      )}

      <div className="w-full min-w-0 max-w-full overflow-x-auto rounded-3xl border border-slate-200">
        <table className="w-full min-w-[1020px] border-collapse bg-white text-left text-sm text-slate-900">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-6 py-4 font-semibold w-12">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="rounded cursor-pointer"
                />
              </th>
              <th className="px-6 py-4 font-semibold">Cliente</th>
              <th className="px-6 py-4 font-semibold">Telefone</th>
              <th className="px-6 py-4 font-semibold">Data</th>
              <th className="px-6 py-4 font-semibold">Hora</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Bairro</th>
              <th className="px-6 py-4 font-semibold">Atendente</th>
              <th className="px-6 py-4 font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {agendamentos.map((item) => (
              <tr
                key={item.id}
                className={`border-t border-slate-100 transition ${
                  selectedIds.has(item.id) ? "bg-sky-50" : "hover:bg-slate-50"
                }`}
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    onChange={() => toggleSelectRow(item.id)}
                    className="rounded cursor-pointer"
                  />
                </td>
                <td className="px-6 py-4 font-medium text-slate-900">{item.cliente_nome || "—"}</td>
                <td className="px-6 py-4">{item.telefone || "—"}</td>
                <td className="px-6 py-4">
                  {item.data_agendamento ? new Date(item.data_agendamento).toLocaleDateString("pt-BR") : "—"}
                </td>
                <td className="px-6 py-4">{item.hora_agendamento || "—"}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      STATUS_BADGES[item.status] || "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {getStatusLabel(item.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{item.area || "—"}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{item.atendente_nome || "Sem atendente"}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700 active:scale-95"
                      title="Editar"
                    >
                      <FaEdit size={12} /> Editar
                    </button>
                    {item.status !== "cancelado" && (
                      <button
                        type="button"
                        onClick={() => onCancel(item.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-rose-100 px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-200 active:scale-95"
                        title="Cancelar"
                      >
                        <FaTimesCircle size={12} /> Cancelar
                      </button>
                    )}
                    {isSupervisor && (
                      <button
                        type="button"
                        onClick={() => onReatribuir(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 px-2.5 py-1.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-200 active:scale-95"
                        title="Reatribuir"
                      >
                        <FaExchangeAlt size={12} /> Reatribuir
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
