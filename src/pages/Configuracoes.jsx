import { useEffect, useMemo, useState } from "react";
import { useAgendamentosContext } from "../hooks/useAgendamentosContext";
import { StatCard } from "../components/ui/Card";
import Card from "../components/ui/Card";
import Header from "../components/layout/Header";
import Toast from "../components/Toast";
import { FaCog, FaUserShield, FaCalendarAlt, FaTrash } from "react-icons/fa";

const ROLE_OPTIONS = [
  { value: "atendente", label: "Atendente" },
  { value: "supervisor", label: "Supervisor" },
  { value: "supervisora", label: "Supervisora" },
  { value: "admin", label: "Admin" },
];

const fieldClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none";

export default function Configuracoes() {
  const [novoNome, setNovoNome] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [novoPerfil, setNovoPerfil] = useState("atendente");
  const [novoAuthId, setNovoAuthId] = useState("");
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);

  const { session, profile, atendentes, servicos, agendamentos, loading, error, isSupervisor, loadAll, createUsuario, deleteUsuario } = useAgendamentosContext();

  useEffect(() => {
    if (!session || !profile) return;
    loadAll();
  }, [session, profile, loadAll]);

  const handleCreateUsuario = async (event) => {
    event.preventDefault();
    setMessage("");
    if (!novoNome.trim() || !novoEmail.trim() || !novoPerfil) { setMessage("Preencha nome, e-mail e perfil para criar um novo usuário."); return; }
    if (!novoEmail.includes("@")) { setMessage("E-mail inválido."); return; }
    setCreating(true);
    const created = await createUsuario({ id: novoAuthId.trim() || undefined, nome: novoNome.trim(), email: novoEmail.trim(), perfil: novoPerfil });
    if (created) { setMessage(`Perfil criado: ${created.nome} (${created.perfil}). ID: ${created.id}`); setNovoNome(""); setNovoEmail(""); setNovoAuthId(""); setNovoPerfil("atendente"); }
    else if (error) setMessage(`Erro: ${error}`);
    setCreating(false);
  };

  const stats = useMemo(() => ({
    servicos: servicos.length, atendentes: atendentes.length, agendamentos: agendamentos.length,
  }), [servicos.length, atendentes.length, agendamentos.length]);

  const handleDeleteUsuario = async (userId, nome) => {
    if (!window.confirm("Excluir o perfil de " + nome + "? Essa ação não pode ser desfeita.")) return;
    const ok = await deleteUsuario(userId);
    if (ok) setFeedback({ type: "success", message: "Perfil de " + nome + " excluído." });
  };

  const [feedback, setFeedback] = useState(null);

  return (
    <>
      <Header title="Configurações" subtitle="Ajuste o perfil e veja o status do sistema" session={session} profile={profile} />
      <div className="page-anim flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Serviços" value={loading ? "—" : stats.servicos} icon={<FaCog size={18} />} iconColor="text-slate-600" />
            <StatCard label="Atendentes" value={loading ? "—" : stats.atendentes} icon={<FaUserShield size={18} />} iconColor="text-warning-600" />
            <StatCard label="Agendamentos" value={loading ? "—" : stats.agendamentos} icon={<FaCalendarAlt size={18} />} iconColor="text-success-600" />
          </div>

          <Card>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5">Seu perfil</h2>
            {error ? <div className="rounded-xl bg-danger-50 border border-danger-200 px-4 py-3 text-sm text-danger-700">{error}</div> : (
              <div className="grid gap-3 sm:grid-cols-2">
                {[{ label: "Nome", value: profile?.nome || "—" }, { label: "E-mail", value: session?.user?.email || "—" }, { label: "Perfil", value: profile?.perfil || "Atendente" }, { label: "Última atualização", value: new Date().toLocaleDateString("pt-BR") }].map((item) => (
                  <div key={item.label} className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                    <p className="text-2xs font-semibold uppercase tracking-wider text-slate-400">{item.label}</p>
                    <p className="mt-1.5 text-sm font-semibold text-slate-800">{item.value}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {isSupervisor && (
            <Card>
              <div className="mb-5">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Gerenciar perfis</h2>
                <p className="text-xs text-slate-400 mt-1">Crie novos usuários e atribua perfis ao sistema</p>
              </div>

              <form onSubmit={handleCreateUsuario} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Nome</label>
                    <input type="text" placeholder="Nome do usuário" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} className={fieldClass} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">E-mail</label>
                    <input type="email" placeholder="usuario@example.com" value={novoEmail} onChange={(e) => setNovoEmail(e.target.value)} className={fieldClass} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Perfil</label>
                    <select value={novoPerfil} onChange={(e) => setNovoPerfil(e.target.value)} className={fieldClass}>
                      {ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">ID do Supabase Auth <span className="text-slate-400 font-normal">(opcional)</span></label>
                  <input type="text" placeholder="UUID do Supabase Auth ou deixe em branco" value={novoAuthId} onChange={(e) => setNovoAuthId(e.target.value)} className={fieldClass} />
                </div>

                <button type="submit" disabled={creating || !novoNome.trim() || !novoEmail.trim()} className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]">
                  {creating ? "Criando..." : "Criar perfil"}
                </button>
              </form>

              {message && <p className="mt-4 text-sm text-slate-600">{message}</p>}

              <div className="mt-6">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Perfis existentes</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {atendentes.map((u) => (
                    <div key={u.id} className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 p-3 group">
                      <div className="h-8 w-8 rounded-lg bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                        {u.nome?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800 truncate">{u.nome || "—"}</p>
                        <p className="text-2xs text-slate-400">{u.perfil || "Atendente"}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteUsuario(u.id, u.nome)}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-danger hover:bg-danger-50 transition-all duration-150 opacity-0 group-hover:opacity-100 shrink-0"
                        title="Excluir"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {feedback && (
        <div className="fixed top-4 right-4 z-[100]"><Toast message={feedback.message} type={feedback.type} onClose={() => setFeedback(null)} /></div>
      )}
    </>
  );
}
