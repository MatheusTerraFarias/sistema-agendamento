import { useCallback, useMemo, useState } from "react";
import { FaEdit, FaExchangeAlt, FaTimesCircle, FaCheck, FaSearch } from "react-icons/fa";

const STATUS_LABELS = {
  novo: "Novo",
  em_andamento: "Em andamento",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
};

const STATUS_BADGES = {
  novo: "bg-primary-50 text-primary-700 ring-1 ring-primary-200/60",
  em_andamento: "bg-warning-50 text-warning-700 ring-1 ring-warning-200/60",
  finalizado: "bg-success-50 text-success-700 ring-1 ring-success-200/60",
  cancelado: "bg-danger-50 text-danger-700 ring-1 ring-danger-200/60",
};

function SkeletonRow() {
  return (
    <tr className="border-t border-slate-100">
      <td className="px-5 py-4"><div className="skeleton h-4 w-4 rounded" /></td>
      <td className="px-5 py-4"><div className="skeleton h-4 w-20 rounded" /></td>
      <td className="px-5 py-4"><div className="skeleton h-4 w-32 rounded" /></td>
      <td className="px-5 py-4"><div className="skeleton h-4 w-24 rounded" /></td>
      <td className="px-5 py-4"><div className="skeleton h-4 w-20 rounded" /></td>
      <td className="px-5 py-4"><div className="skeleton h-4 w-16 rounded" /></td>
      <td className="px-5 py-4"><div className="skeleton h-6 w-20 rounded-lg" /></td>
      <td className="px-5 py-4"><div className="skeleton h-4 w-28 rounded" /></td>
      <td className="px-5 py-4"><div className="skeleton h-4 w-20 rounded" /></td>
      <td className="px-5 py-4"><div className="skeleton h-8 w-24 rounded-lg" /></td>
    </tr>
  );
}

export default function AgendamentosTable({ agendamentos, loading, onEdit, onCancel, onReatribuir, isSupervisor, onBulkAction, onBulkReatribuir }) {
  const [selectedIds, setSelectedIds] = useState(new Set());

  const allSelected = useMemo(
    () => agendamentos.length > 0 && selectedIds.size === agendamentos.length,
    [agendamentos.length, selectedIds.size]
  );

  const toggleSelectAll = useCallback(() => {
    setSelectedIds(allSelected ? new Set() : new Set(agendamentos.map((a) => a.id)));
  }, [allSelected, agendamentos]);

  const toggleSelectRow = useCallback(
    (id) => setSelectedIds((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; }),
    []
  );

  const handleBulkCancel = useCallback(() => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`Deseja cancelar ${selectedIds.size} agendamento(s)?`)) {
      onBulkAction?.("cancel", Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  }, [selectedIds, onBulkAction]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-card">
        <table className="w-full min-w-[1020px] border-collapse text-sm">
          <thead className="bg-slate-50/80 border-b border-slate-200">
            <tr>
              {["", "OS", "Cliente", "Telefone", "Data", "Hora", "Status", "Bairro", "Atendente", "Ações"].map((h) => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>{Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}</tbody>
        </table>
      </div>
    );
  }

  if (agendamentos.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-16 text-center">
        <FaSearch className="mx-auto text-slate-300 mb-3" size={32} />
        <p className="text-slate-600 font-semibold">Nenhum agendamento encontrado</p>
        <p className="text-slate-400 text-sm mt-1">Ajuste seus filtros ou crie um novo agendamento</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-xl border border-primary-200 bg-primary-50/50 px-4 py-3 animate-fade-in">
          <span className="text-sm font-semibold text-primary-700">{selectedIds.size} selecionado(s)</span>
          <div className="flex gap-2 sm:ml-auto">
            {isSupervisor && (
              <button
                onClick={() => onBulkReatribuir?.(Array.from(selectedIds))}
                className="inline-flex items-center gap-1.5 rounded-lg bg-warning-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-warning-600 transition-all duration-200"
              >
                <FaExchangeAlt size={11} /> Reatribuir
              </button>
            )}
            <button
              onClick={handleBulkCancel}
              className="inline-flex items-center gap-1.5 rounded-lg bg-danger-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-danger-600 transition-all duration-200"
            >
              <FaTimesCircle size={11} /> Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1020px] border-collapse text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 w-12">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-primary focus:ring-primary/20 cursor-pointer"
                    aria-label="Selecionar todos"
                  />
                </th>
                {["OS", "Cliente", "Telefone", "Data", "Hora", "Status", "Bairro", "Atendente", "Ações"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {agendamentos.map((item) => (
                <tr
                  key={item.id}
                  className={`transition-colors duration-150 ${
                    selectedIds.has(item.id) ? "bg-primary-50/40" : "hover:bg-slate-50/80"
                  }`}
                >
                  <td className="px-5 py-3.5">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(item.id)}
                      onChange={() => toggleSelectRow(item.id)}
                      className="rounded border-slate-300 text-primary focus:ring-primary/20 cursor-pointer"
                      aria-label={`Selecionar ${item.cliente_nome}`}
                    />
                  </td>
                  <td className="px-5 py-3.5 text-slate-700 font-mono text-xs font-semibold max-w-[120px] truncate">{item.protocolo || "—"}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-800 max-w-[200px] truncate">{item.cliente_nome || "—"}</td>
                  <td className="px-5 py-3.5 text-slate-500 max-w-[160px] truncate">{item.telefone || "—"}</td>
                  <td className="px-5 py-3.5 text-slate-600 tabular-nums">
                    {item.data_agendamento ? new Date(item.data_agendamento + "T12:00:00").toLocaleDateString("pt-BR") : "—"}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 tabular-nums">{item.hora_agendamento || "—"}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ${STATUS_BADGES[item.status] || "bg-slate-100 text-slate-600"}`}>
                      {STATUS_LABELS[item.status] || "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs max-w-[140px] truncate">{item.bairro || "—"}</td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs max-w-[120px] truncate">{item.atendente_nome || "—"}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 active:scale-95 transition-all duration-150"
                        title="Editar"
                      >
                        <FaEdit size={11} /> Editar
                      </button>
                      {item.status !== "cancelado" && (
                        <button
                          type="button"
                          onClick={() => onCancel(item.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-danger-50 px-2.5 py-1.5 text-xs font-semibold text-danger-600 hover:bg-danger-100 active:scale-95 transition-all duration-150"
                          title="Cancelar"
                        >
                          <FaTimesCircle size={11} /> Cancelar
                        </button>
                      )}
                      {isSupervisor && (
                        <button
                          type="button"
                          onClick={() => onReatribuir(item)}
                          className="inline-flex items-center gap-1 rounded-lg bg-warning-50 px-2.5 py-1.5 text-xs font-semibold text-warning-600 hover:bg-warning-100 active:scale-95 transition-all duration-150"
                          title="Reatribuir"
                        >
                          <FaExchangeAlt size={11} /> Reatribuir
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
    </div>
  );
}
