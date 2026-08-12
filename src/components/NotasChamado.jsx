import { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaExclamationTriangle, FaStickyNote } from "react-icons/fa";
import { useNotas } from "../hooks/useNotas";

const MAX_LEN = 2000;

function formatDateTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const date = d.toLocaleDateString("pt-BR");
  const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${date} as ${time}`;
}

function isEdited(nota) {
  if (!nota?.atualizado_em || !nota?.criado_em) return false;
  return new Date(nota.atualizado_em).getTime() - new Date(nota.criado_em).getTime() > 1000;
}

export default function NotasChamado({ chamado, session, profile, isSupervisor }) {
  const { notas, loading, saving, error, success, setSuccess, loadNotas, addNota, updateNota, deleteNota } = useNotas({ session, profile });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [novoTexto, setNovoTexto] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [editandoTexto, setEditandoTexto] = useState("");
  const [confirmandoExclusaoId, setConfirmandoExclusaoId] = useState(null);
  const [salvandoId, setSalvandoId] = useState(null);

  useEffect(() => {
    if (chamado?.id) loadNotas(chamado.id);
  }, [chamado?.id, loadNotas]);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(null), 4000);
    return () => clearTimeout(t);
  }, [success, setSuccess]);

  const podeGerenciar = (nota) => Boolean(session?.user?.id && (nota.usuario_id === session.user.id || isSupervisor));

  async function handleSalvarNova() {
    const texto = novoTexto.trim();
    if (!texto || saving) return;
    setSalvandoId("nova");
    const criada = await addNota(texto);
    setSalvandoId(null);
    if (criada) {
      setNovoTexto("");
      setMostrarFormulario(false);
    }
  }

  async function handleSalvarEdicao(id) {
    const texto = editandoTexto.trim();
    if (!texto || saving) return;
    setSalvandoId(id);
    const atualizada = await updateNota(id, texto);
    setSalvandoId(null);
    if (atualizada) {
      setEditandoId(null);
      setEditandoTexto("");
    }
  }

  async function handleExcluir(id) {
    if (saving) return;
    setSalvandoId(id);
    const ok = await deleteNota(id);
    setSalvandoId(null);
    if (ok) setConfirmandoExclusaoId(null);
  }

  function abrirEdicao(nota) {
    setEditandoId(nota.id);
    setEditandoTexto(nota.conteudo);
    setMostrarFormulario(false);
    setConfirmandoExclusaoId(null);
  }

  return (
    <div className="space-y-4">
      {/* Titulo + acao */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FaStickyNote className="text-primary-500" size={16} />
          <h3 className="text-sm font-bold text-slate-800">Notas do chamado</h3>
          {notas.length > 0 && (
            <span className="rounded-full bg-primary-50 text-primary-700 text-2xs font-bold px-2 py-0.5">{notas.length}</span>
          )}
        </div>
        {!mostrarFormulario && (
          <button
            type="button"
            onClick={() => { setMostrarFormulario(true); setEditandoId(null); setConfirmandoExclusaoId(null); }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 transition-all duration-200 active:scale-95 disabled:opacity-50"
          >
            <FaPlus size={10} /> Adicionar nota
          </button>
        )}
      </div>

      {/* Feedback de sucesso */}
      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-success-50 border border-success-200 px-3 py-2 text-xs font-medium text-success-700 animate-fade-in">
          <FaCheckCircle size={13} /> {success}
        </div>
      )}

      {/* Erro ao carregar/salvar */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-danger-50 border border-danger-200 px-3 py-2.5 text-xs font-medium text-danger-700">
          <FaExclamationTriangle size={13} className="mt-0.5 shrink-0" />
          <div className="flex-1">{error}</div>
          <button type="button" onClick={() => loadNotas(chamado?.id)} className="font-bold underline hover:opacity-70">Tentar de novo</button>
        </div>
      )}

      {/* Formulario nova nota */}
      {mostrarFormulario && (
        <div className="rounded-xl border border-primary-200 bg-primary-50/40 p-3 space-y-2 animate-fade-in">
          <textarea
            value={novoTexto}
            onChange={(e) => setNovoTexto(e.target.value)}
            rows={4}
            maxLength={MAX_LEN}
            placeholder="Escreva a observacao do atendimento..."
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 resize-y transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none"
            autoFocus
          />
          <div className="flex items-center gap-2">
            <span className="text-2xs text-slate-400 tabular-nums">{novoTexto.length}/{MAX_LEN}</span>
            <div className="flex gap-2 ml-auto">
              <button
                type="button"
                onClick={() => { setMostrarFormulario(false); setNovoTexto(""); }}
                disabled={saving}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all duration-200 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSalvarNova}
                disabled={saving || !novoTexto.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 transition-all duration-200 disabled:opacity-50 active:scale-95"
              >
                {saving && salvandoId === "nova" ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Carregando */}
      {loading && (
        <div className="space-y-3 py-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-slate-100 p-3 space-y-2">
              <div className="skeleton h-3 w-40 rounded" />
              <div className="skeleton h-3 w-full rounded" />
              <div className="skeleton h-3 w-2/3 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Sem notas */}
      {!loading && notas.length === 0 && !mostrarFormulario && (
        <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white px-6 py-8 text-center">
          <FaStickyNote className="mx-auto text-slate-300 mb-2" size={22} />
          <p className="text-sm font-semibold text-slate-600">Nenhuma nota registrada ainda.</p>
          <button
            type="button"
            onClick={() => setMostrarFormulario(true)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-primary-700 transition-all duration-200 active:scale-95"
          >
            <FaPlus size={10} /> Adicionar primeira nota
          </button>
        </div>
      )}

      {/* Timeline */}
      {!loading && notas.length > 0 && (
        <ol className="relative space-y-4 pl-5 before:absolute before:left-[5px] before:top-1 before:bottom-1 before:w-px before:bg-slate-200">
          {notas.map((nota) => {
            const editando = editandoId === nota.id;
            const confirmando = confirmandoExclusaoId === nota.id;
            const salvandoEsta = saving && salvandoId === nota.id;

            return (
              <li key={nota.id} className="relative">
                <span className={`absolute -left-5 top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${nota.usuario_id === session?.user?.id ? "bg-primary-500" : "bg-slate-300"}`} />
                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-xs font-bold text-slate-800">{nota.usuario_nome || "Atendente"}</span>
                    <span className="text-2xs text-slate-400">• {formatDateTime(nota.criado_em)}</span>
                    {isEdited(nota) && (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-2xs font-medium text-slate-500">editada</span>
                    )}
                  </div>

                  {editando ? (
                    <div className="mt-2 space-y-2">
                      <textarea
                        value={editandoTexto}
                        onChange={(e) => setEditandoTexto(e.target.value)}
                        rows={4}
                        maxLength={MAX_LEN}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 resize-y transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none"
                        autoFocus
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-2xs text-slate-400 tabular-nums">{editandoTexto.length}/{MAX_LEN}</span>
                        <div className="flex gap-2 ml-auto">
                          <button
                            type="button"
                            onClick={() => { setEditandoId(null); setEditandoTexto(""); }}
                            disabled={saving}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all duration-200 disabled:opacity-50"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSalvarEdicao(nota.id)}
                            disabled={saving || !editandoTexto.trim()}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 transition-all duration-200 disabled:opacity-50 active:scale-95"
                          >
                            {salvandoEsta ? "Salvando..." : "Salvar"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="mt-1.5 text-sm text-slate-700 whitespace-pre-wrap break-words leading-relaxed">{nota.conteudo}</p>

                      {confirmando ? (
                        <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg bg-danger-50 border border-danger-200 px-3 py-2">
                          <span className="text-xs font-medium text-danger-700">Tem certeza que deseja excluir esta nota?</span>
                          <div className="flex gap-2 ml-auto">
                            <button
                              type="button"
                              onClick={() => setConfirmandoExclusaoId(null)}
                              disabled={saving}
                              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-2xs font-semibold text-slate-600 hover:bg-slate-50 transition-all duration-200 disabled:opacity-50"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleExcluir(nota.id)}
                              disabled={saving}
                              className="inline-flex items-center gap-1 rounded-lg bg-danger-600 px-2.5 py-1 text-2xs font-semibold text-white hover:bg-danger-700 transition-all duration-200 disabled:opacity-50"
                            >
                              {salvandoEsta ? "Excluindo..." : "Excluir"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        podeGerenciar(nota) && (
                          <div className="mt-2 flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => abrirEdicao(nota)}
                              className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 text-2xs font-semibold text-slate-600 hover:bg-slate-100 transition-all duration-200"
                            >
                              <FaEdit size={10} /> Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmandoExclusaoId(nota.id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-danger-50 px-2 py-1 text-2xs font-semibold text-danger-600 hover:bg-danger-100 transition-all duration-200"
                            >
                              <FaTrash size={10} /> Excluir
                            </button>
                          </div>
                        )
                      )}
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
