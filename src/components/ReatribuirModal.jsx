import { useState } from "react";

export default function ReatribuirModal({ agendamento, agendamentos = [], atendentes = [], onSubmit, onClose, loading }) {
  const [selectedId, setSelectedId] = useState("");
  const [motivo, setMotivo] = useState("");
  const isBulk = agendamentos?.length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedId || !motivo.trim()) return;
    const targetId = isBulk ? agendamentos.map((a) => a.id) : agendamento.id;
    onSubmit(targetId, selectedId, motivo.trim());
  };

  return (
    <div className="space-y-5">
      {isBulk && (
        <p className="text-sm text-slate-500">Reatribuindo {agendamentos.length} agendamento(s)</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Novo atendente</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none"
          >
            <option value="">Selecione um atendente</option>
            {atendentes.map((at) => (
              <option key={at.id} value={at.id}>{at.nome}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Motivo da reatribuição</label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            required
            placeholder="Descreva o motivo brevemente"
            rows={3}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 resize-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end pt-1">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all duration-200">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !selectedId || !motivo.trim()}
            className="rounded-xl bg-warning-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-warning-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {loading ? "Reatribuindo..." : "Confirmar reatribuição"}
          </button>
        </div>
      </form>
    </div>
  );
}
