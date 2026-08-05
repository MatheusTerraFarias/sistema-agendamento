import { useState } from "react";

export default function AgendamentoForm({ initialData = {}, clientes = [], servicos = [], onSubmit, onClose, loading }) {
  const [clienteId, setClienteId] = useState(initialData.cliente_id || "");
  const [servicoId, setServicoId] = useState(initialData.servico_id || "");
  const [dataAgendamento, setDataAgendamento] = useState(initialData.data_agendamento || "");
  const [horaAgendamento, setHoraAgendamento] = useState(initialData.hora_agendamento || "");
  const [observacao, setObservacao] = useState(initialData.observacao || "");
  const [status, setStatus] = useState(initialData.status || "novo");

  const handleSubmit = async (event) => {
    event.preventDefault();

    await onSubmit({
      cliente_id: clienteId ? Number(clienteId) : null,
      servico_id: servicoId ? Number(servicoId) : null,
      data_agendamento: dataAgendamento || null,
      hora_agendamento: horaAgendamento || null,
      observacao: observacao.trim() || null,
      status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Cliente</span>
          <select
            value={clienteId}
            onChange={(event) => setClienteId(event.target.value)}
            required
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">Selecione um cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nome}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Serviço</span>
          <select
            value={servicoId}
            onChange={(event) => setServicoId(event.target.value)}
            required
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">Selecione um serviço</option>
            {servicos.map((servico) => (
              <option key={servico.id} value={servico.id}>
                {servico.nome}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Data</span>
          <input
            type="date"
            value={dataAgendamento}
            onChange={(event) => setDataAgendamento(event.target.value)}
            required
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Hora</span>
          <input
            type="time"
            value={horaAgendamento}
            onChange={(event) => setHoraAgendamento(event.target.value)}
            required
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </label>

        {initialData.id ? (
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            >
              <option value="novo">Novo</option>
              <option value="em_andamento">Em andamento</option>
              <option value="finalizado">Finalizado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </label>
        ) : (
          <div />
        )}
      </div>

      <label className="block">
        <span className="text-sm font-semibold text-slate-700">Observação</span>
        <textarea
          value={observacao}
          onChange={(event) => setObservacao(event.target.value)}
          placeholder="Notas adicionais ou contexto do agendamento"
          rows={3}
          className="mt-1 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
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
          disabled={loading}
          className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {initialData.id ? "Salvar alterações" : "Criar agendamento"}
        </button>
      </div>
    </form>
  );
}
