import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { FaCalendarAlt, FaClock, FaEdit, FaExchangeAlt, FaHistory, FaPhone, FaPlus, FaStickyNote, FaTimes, FaTimesCircle, FaUser } from "react-icons/fa";
import NotasChamado from "./NotasChamado";
import { useHistorico } from "../hooks/useHistorico";

import { STATUS_LABELS, STATUS_BADGES, STATUS_OPTIONS } from "../lib/statusOptions";

const ACAO_CONFIG = {
  edicao: { label: "Edicao", icon: FaEdit, color: "text-primary-600 bg-primary-50" },
  cancelamento: { label: "Cancelamento", icon: FaTimesCircle, color: "text-danger-600 bg-danger-50" },
  reatribuicao: { label: "Reatribuicao", icon: FaExchangeAlt, color: "text-warning-600 bg-warning-50" },
  criacao: { label: "Criacao", icon: FaPlus, color: "text-success-600 bg-success-50" },
};

const fieldClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none";
const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

function InfoItem({ label, value, icon }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
      <p className="text-2xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">{icon}{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800 break-words">{value}</p>
    </div>
  );
}

function formatDateTime(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("pt-BR") + " as " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function CampoAlterado({ campo, de, para }) {
  return (
    <div className="text-xs">
      <span className="font-bold text-slate-700">{campo}:</span>
      <span className="text-slate-400 line-through ml-1.5">{de}</span>
      <span className="text-slate-400 mx-1">-&gt;</span>
      <span className="font-semibold text-slate-800">{para}</span>
    </div>
  );
}

export default function OrdemDetalhe({ ordem, session, profile, isSupervisor, servicos, atendentes, onClose, onSave, onCancelar, onReatribuir, onAgendar, loading }) {
  const { historico, loading: loadingHistorico, loadHistorico } = useHistorico({ session, profile });
  const [mudandoStatus, setMudandoStatus] = useState(false);
  const [salvando, setSalvando] = useState(false);
  
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (ordem?.id) loadHistorico(ordem.id);
  }, [ordem?.id, loadHistorico]);

  

  const cliente = null;
  const servico = useMemo(() => servicos.find((s) => s.id === ordem?.servico_id), [servicos, ordem]);
  const atendente = useMemo(
    () => atendentes.find((a) => a.id === ordem?.criado_por) || atendentes.find((a) => a.id === ordem?.distribuido_para),
    [atendentes, ordem]
  );

  async function handleMudarStatus(novoStatus) {
    if (!novoStatus || salvando || novoStatus === ordem?.status) return;
    setSalvando(true);
    setErro(null);
    const ok = await onSave({ status: novoStatus });
    setSalvando(false);
    if (ok) {
      setMudandoStatus(false);
      await loadHistorico(ordem.id);
    } else {
      setErro("Falha ao atualizar status.");
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
      <div className="absolute inset-y-0 right-0 w-full max-w-2xl bg-slate-50/95 backdrop-blur flex flex-col shadow-2xl animate-slideIn" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900">Ordem #{ordem?.protocolo || ordem?.id || "-"}</h2>
              <span className={"inline-flex rounded-lg px-2.5 py-1 text-xs font-bold " + (STATUS_BADGES[ordem?.status] || STATUS_BADGES.novo)}>{STATUS_LABELS[ordem?.status] || ordem?.status || "-"}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 truncate">{ordem?.cliente_nome || "Cliente nao encontrado"}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!mudandoStatus && (
              <button type="button" onClick={() => setMudandoStatus(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-2 text-xs font-semibold text-white hover:bg-primary-700 transition-all duration-200 active:scale-95">
                <FaEdit size={11} /> Alterar Status
              </button>
            )}
            <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition" aria-label="Fechar">
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {erro && (
            <div className="rounded-xl bg-danger-50 border border-danger-200 px-4 py-3 text-xs font-medium text-danger-700">{erro}</div>
          )}

          {/* Informacoes */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Informacoes do chamado</h3>
            {mudandoStatus ? (
              <div className="space-y-3 rounded-2xl border border-primary-200 bg-white p-5">
                <p className="text-xs text-slate-500 font-medium">Selecione o novo status:</p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleMudarStatus(opt.value)}
                      disabled={salvando || loading || opt.value === ordem?.status}
                      className={"rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200 active:scale-95 " + (opt.value === ordem?.status ? "opacity-40 cursor-not-allowed " : "") + (STATUS_BADGES[opt.value] || "bg-slate-100 text-slate-600")}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 justify-end pt-1">
                  <button type="button" onClick={() => setMudandoStatus(false)} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all duration-200">Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <InfoItem label="Protocolo / OS" value={ordem?.protocolo || "-"} icon={<FaHistory size={10} />} />
                <InfoItem label="Cliente" value={ordem?.cliente_nome || "-"} icon={<FaUser size={10} />} />
                <InfoItem label="Telefone" value={ordem?.telefone || "-"} icon={<FaPhone size={10} />} />
                <InfoItem label="Servico" value={ordem?.servico_nome || servico?.nome || "-"} icon={<FaStickyNote size={10} />} />
                <InfoItem label="Data" value={ordem?.data_agendamento ? new Date(ordem.data_agendamento + "T12:00:00").toLocaleDateString("pt-BR") : "-"} icon={<FaClock size={10} />} />
                <InfoItem label="Hora" value={ordem?.hora_agendamento || "-"} icon={<FaClock size={10} />} />
                <InfoItem label="Bairro" value={ordem?.bairro || "-"} icon={<FaHistory size={10} />} />
                <InfoItem label="Area" value={ordem?.area || "-"} icon={<FaHistory size={10} />} />
                <InfoItem label="Atendente" value={atendente?.nome || ordem?.atendente_nome || "-"} icon={<FaUser size={10} />} />
                <InfoItem label="Fonte" value={ordem?.fonte === "google_sheets" ? "Google Sheets" : (ordem?.fonte || "-")} icon={<FaHistory size={10} />} />
                <InfoItem label="Criado em" value={formatDateTime(ordem?.created_at)} icon={<FaClock size={10} />} />
                <InfoItem label="Atualizado em" value={formatDateTime(ordem?.updated_at)} icon={<FaClock size={10} />} />
              </div>
            )}
          </section>

          {/* Observacao */}
          {!mudandoStatus && ordem?.observacao && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Observacao</h3>
              <p className="rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm text-slate-700 whitespace-pre-wrap break-words leading-relaxed">{ordem.observacao}</p>
            </section>
          )}

          {/* Notas */}
          <section>
            <NotasChamado chamado={ordem} session={session} profile={profile} isSupervisor={isSupervisor} />
          </section>

          {/* Historico de edicoes */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <FaHistory className="text-primary-500" size={14} />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Historico de edicoes</h3>
            </div>
            {loadingHistorico ? (
              <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
            ) : historico.length === 0 ? (
              <p className="text-sm text-slate-400">Nenhuma edicao registrada ate o momento.</p>
            ) : (
              <ol className="relative space-y-4 before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
                {historico.map((item) => {
                  const cfg = ACAO_CONFIG[item.acao] || ACAO_CONFIG.edicao;
                  const Icon = cfg.icon;
                  const campos = Array.isArray(item.campos_alterados) ? item.campos_alterados : [];
                  return (
                    <li key={item.id} className="relative pl-8">
                      <span className={"absolute left-0 top-1 flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-white " + cfg.color}>
                        <Icon size={9} />
                      </span>
                      <div className="rounded-xl border border-slate-100 bg-white px-4 py-3">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-xs font-bold text-slate-800">{item.usuario_nome || "Desconhecido"}</span>
                          <span className="text-2xs text-slate-400">{formatDateTime(item.criado_em)}</span>
                          <span className="ml-auto rounded-md bg-slate-100 px-2 py-0.5 text-2xs font-bold text-slate-500">{cfg.label}</span>
                        </div>
                        {item.descricao && <p className="mt-1 text-xs text-slate-600">{item.descricao}</p>}
                        {campos.length > 0 && (
                          <div className="mt-2 space-y-1 rounded-lg bg-slate-50 px-3 py-2">
                            {campos.map((c, i) => <CampoAlterado key={i} campo={c.campo} de={c.de} para={c.para} />)}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </div>

        {/* Rodape de acoes */}
        <div className="flex items-center gap-2 border-t border-slate-200 bg-white px-6 py-3 shrink-0">
          {ordem?.status !== "cancelado" && (
            <button type="button" onClick={() => onCancelar(ordem)} className="inline-flex items-center gap-1.5 rounded-lg bg-danger-50 px-3 py-2 text-xs font-semibold text-danger-600 hover:bg-danger-100 transition-all duration-200">
              <FaTimesCircle size={11} /> Cancelar chamado
            </button>
          )}
          {ordem?.status === "confirmado" && ordem?.data_agendamento && (
            <button type="button" onClick={() => onAgendar?.(ordem)} className="inline-flex items-center gap-1.5 rounded-lg bg-success-600 px-3 py-2 text-xs font-semibold text-white hover:bg-success-700 transition-all duration-200 ml-auto">
              <FaCalendarAlt size={11} /> Agendar
            </button>
          )}
          {isSupervisor && (
            <button type="button" onClick={() => onReatribuir(ordem)} className="inline-flex items-center gap-1.5 rounded-lg bg-warning-50 px-3 py-2 text-xs font-semibold text-warning-600 hover:bg-warning-100 transition-all duration-200">
              <FaExchangeAlt size={11} /> Reatribuir
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
