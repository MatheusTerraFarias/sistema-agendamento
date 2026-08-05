import { useState } from "react";

export default function ReatribuirModal({ agendamento, atendentes, onSubmit, onClose, loading }) {
  const [selectedAtendente, setSelectedAtendente] = useState(agendamento?.criado_por || "");
  const [motivo, setMotivo] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedAtendente || !motivo.trim()) return;
    await onSubmit(agendamento.id, selectedAtendente, motivo.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm text-slate-500">Agendamento:</p>
        <p className="mt-1 text-base font-semibold text-slate-900">{agendamento?.cliente_nome || `#${agendamento?.id}`}</p>
        <p className="text-sm text-slate-600">Telefone: {agendamento?.telefone || "—"}</p>
      </div>

      <label className="block">
        <span className="text-sm font-semibold text-slate-700">Novo atendente</span>
        <select
          value={selectedAtendente}
          onChange={(event) => setSelectedAtendente(event.target.value)}
          className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
        >
          <option value="">Selecione um atendente</option>
          {atendentes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nome}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-slate-700">Motivo</span>
        <textarea
          value={motivo}
          onChange={(event) => setMotivo(event.target.value)}
          required
          placeholder="Explique o motivo da reatribuição"
          className="mt-1 h-24 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
        />
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || !selectedAtendente}
          className="rounded-full bg-amber-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-amber-400"
        >
          Confirmar reatribuição
        </button>
      </div>
    </form>
  );
}
