import { useEffect, useMemo, useState } from "react";
import { useAgendamentos } from "../hooks/useAgendamentos";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const ROLE_OPTIONS = [
  { value: "atendente", label: "Atendente" },
  { value: "supervisor", label: "Supervisor" },
  { value: "supervisora", label: "Supervisora" },
  { value: "admin", label: "Admin" },
];

export default function Configuracoes() {
  const [novoNome, setNovoNome] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [novoPerfil, setNovoPerfil] = useState("atendente");
  const [novoAuthId, setNovoAuthId] = useState("");
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);

  const {
    session,
    profile,
    atendentes,
    clientes,
    servicos,
    agendamentos,
    loading,
    error,
    isSupervisor,
    loadAll,
    createUsuario,
  } = useAgendamentos();

  useEffect(() => {
    if (!session || !profile) return;
    loadAll();
  }, [session, profile, loadAll]);

  const handleCreateUsuario = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!novoNome.trim() || !novoEmail.trim() || !novoPerfil) {
      setMessage("Preencha nome, e-mail e perfil para criar um novo usuário.");
      return;
    }

    if (!novoEmail.includes("@")) {
      setMessage("E-mail inválido.");
      return;
    }

    setCreating(true);
    const created = await createUsuario({
      id: novoAuthId.trim() || undefined,
      nome: novoNome.trim(),
      email: novoEmail.trim(),
      perfil: novoPerfil,
    });
    if (created) {
      setMessage(
        `Perfil criado com sucesso: ${created.nome} (${created.perfil}). ID: ${created.id}`
      );
      setNovoNome("");
      setNovoEmail("");
      setNovoAuthId("");
      setNovoPerfil("atendente");
    } else if (error) {
      setMessage(`Erro: ${error}`);
    }
    setCreating(false);
  };

  const stats = useMemo(
    () => ({
      clientes: clientes.length,
      servicos: servicos.length,
      atendentes: atendentes.length,
      agendamentos: agendamentos.length,
    }),
    [clientes.length, servicos.length, atendentes.length, agendamentos.length]
  );

  return (
    <div className="page-anim min-h-screen bg-slate-100 py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">Configurações</h1>
          <p className="mt-2 text-slate-600">
            Ajuste as informações do seu perfil e veja o status atual do sistema.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
          <Card>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Clientes</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{loading ? "..." : stats.clientes}</p>
          </Card>
          <Card>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Serviços</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{loading ? "..." : stats.servicos}</p>
          </Card>
          <Card>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Atendentes</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{loading ? "..." : stats.atendentes}</p>
          </Card>
          <Card>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Agendamentos</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{loading ? "..." : stats.agendamentos}</p>
          </Card>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Seu perfil</h2>
          {error ? (
            <p className="text-rose-600">{error}</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-6">
                <p className="text-sm text-slate-500">Nome</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{profile?.nome || "—"}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-6">
                <p className="text-sm text-slate-500">E-mail</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{session?.user?.email || "—"}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-6">
                <p className="text-sm text-slate-500">Perfil</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{profile?.perfil || "Atendente"}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-6">
                <p className="text-sm text-slate-500">Última atualização</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{new Date().toLocaleDateString("pt-BR")}</p>
              </div>
            </div>
          )}
        </div>

        {isSupervisor ? (
          <div className="rounded-3xl bg-white p-6 shadow-sm mt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Gerenciar perfis</h2>
                <p className="mt-1 text-slate-600">O admin pode criar novos usuários e atribuir perfis ao sistema.</p>
              </div>
            </div>

            <form onSubmit={handleCreateUsuario} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-600">Nome</label>
                  <Input
                    type="text"
                    placeholder="Nome do usuário"
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">E-mail</label>
                  <Input
                    type="email"
                    placeholder="usuario@example.com"
                    value={novoEmail}
                    onChange={(e) => setNovoEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Perfil</label>
                  <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3">
                    <select
                      className="w-full bg-transparent text-sm text-slate-800 outline-none"
                      value={novoPerfil}
                      onChange={(e) => setNovoPerfil(e.target.value)}
                    >
                      {ROLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">
                  ID do Supabase Auth <span className="text-slate-400">(opcional)</span>
                </label>
                <Input
                  type="text"
                  placeholder="Cole o UUID do usuário já criado no Supabase Auth, ou deixe em branco para gerar automaticamente"
                  value={novoAuthId}
                  onChange={(e) => setNovoAuthId(e.target.value)}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Se deixar em branco, um UUID será gerado automaticamente. Para vincular a um usuário existente no
                  Supabase Auth, cole o ID do usuário aqui.
                </p>
              </div>

              <Button type="submit" disabled={creating || !novoNome.trim() || !novoEmail.trim()}>
                {creating ? "Criando..." : "Criar perfil"}
              </Button>
            </form>

            {message ? <p className="mt-4 text-sm text-slate-600">{message}</p> : null}

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Perfis existentes</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {atendentes.map((usuario) => (
                  <div key={usuario.id} className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">{usuario.nome || "—"}</p>
                    <p className="mt-2 font-semibold text-slate-900">{usuario.perfil || "Atendente"}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
