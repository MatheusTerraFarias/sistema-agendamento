import { useState } from "react";

const fieldClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none disabled:bg-slate-50 disabled:opacity-50";
const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

export default function AgendamentoForm({ initialData = {}, servicos = [], onSubmit, onClose, loading, isSupervisor = true }) {
  const [clienteNome, setClienteNome] = useState(initialData.cliente_nome || "");
  const [servicoId, setServicoId] = useState(initialData.servico_id || "");
  const [dataAgendamento, setDataAgendamento] = useState(initialData.data_agendamento || "");
  const [horaAgendamento, setHoraAgendamento] = useState(initialData.hora_agendamento || "");
  const [observacao, setObservacao] = useState(initialData.observacao || "");
  const [status, setStatus] = useState(initialData.status || "novo");
  const [bairro, setBairro] = useState(initialData.bairro || "");
  const [telefone, setTelefone] = useState(initialData.telefone || "");

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit({
      cliente_nome: clienteNome.trim() || null,
      telefone: telefone.trim() || null,
      servico_id: servicoId ? Number(servicoId) : null,
      data_agendamento: dataAgendamento || null,
      hora_agendamento: horaAgendamento || null,
      observacao: observacao.trim() || null,
      status,
      bairro: bairro.trim() || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {isSupervisor ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Cliente</label>
            <input type="text" value={clienteNome} onChange={(e) => setClienteNome(e.target.value)} placeholder="Nome do cliente" required className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>Telefone</label>
            <input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 99999-9999" className={fieldClass} />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Cliente</label>
            <input type="text" value={clienteNome} readOnly className={fieldClass + " bg-slate-50"} />
          </div>
          <div>
            <label className={labelClass}>Telefone</label>
            <input type="text" value={telefone} readOnly className={fieldClass + " bg-slate-50"} />
          </div>
        </div>
      )}

      {isSupervisor ? (
        <div>
          <label className={labelClass}>Servico</label>
          <select value={servicoId} onChange={(e) => setServicoId(e.target.value)} className={fieldClass}>
            <option value="">Selecione um servico</option>
            {servicos.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
        </div>
      ) : (
        <div>
          <label className={labelClass}>Servico</label>
          <input type="text" value={servicos.find((s) => String(s.id) === String(servicoId))?.nome || ""} readOnly className={fieldClass + " bg-slate-50"} />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Data</label>
          <input type="date" value={dataAgendamento} onChange={(e) => setDataAgendamento(e.target.value)} className={fieldClass} />
        </div>
        <div>
          <label className={labelClass}>Hora</label>
          <input type="time" value={horaAgendamento} onChange={(e) => setHoraAgendamento(e.target.value)} className={fieldClass} />
        </div>
        {initialData.id ? (
          <div>
            <label className={labelClass}>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={fieldClass}>
              <option value="novo">Novo</option>
              <option value="em_andamento">Em andamento</option>
              <option value="finalizado">Finalizado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        ) : <div />}
      </div>

      {isSupervisor ? (
        <div>
          <label className={labelClass}>Bairro</label>
          <input type="text" value={bairro} onChange={(e) => setBairro(e.target.value)} placeholder="Ex: Vila Mariana" className={fieldClass} />
        </div>
      ) : (
        <div>
          <label className={labelClass}>Bairro</label>
          <input type="text" value={bairro} readOnly className={fieldClass + " bg-slate-50"} />
        </div>
      )}
      <div>
        <label className={labelClass}>Observacao</label>
        <textarea
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          placeholder="Notas adicionais ou contexto do chamado"
          rows={3}
          className={`${fieldClass} resize-none`}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end pt-2">
        <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all duration-200 active:scale-[0.98]">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {loading && (
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {initialData.id ? "Salvar alteracoes" : "Criar chamado"}
        </button>
      </div>
    </form>
  );
}
