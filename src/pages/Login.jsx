import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Navigate, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [sessionChecked, setSessionChecked] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function verifySession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        setHasSession(Boolean(session));
      } catch (err) {
        console.error("Login session check error:", err);
      } finally {
        if (mounted) setSessionChecked(true);
      }
    }
    verifySession();
    return () => { mounted = false; };
  }, []);

  if (sessionChecked && hasSession) return <Navigate to="/dashboard" replace />;

  async function fazerLogin(e) {
    e.preventDefault();
    if (!email || !senha) {
      setLoginError("Informe e-mail e senha para entrar.");
      return;
    }
    setLoading(true);
    setLoginError("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) { setLoginError(error.message); return; }
      if (!data?.session) { setLoginError("Não foi possível iniciar sessão. Tente novamente."); return; }
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setLoginError(err?.message || "Erro inesperado ao fazer login.");
    } finally {
      setLoading(false);
    }
  }

  async function resetSenha() {
    if (!email) { setResetMessage("Informe seu e-mail para resetar a senha."); return; }
    setResetLoading(true);
    setResetMessage("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset` });
      setResetMessage(error ? error.message : "E-mail de recuperação enviado com sucesso.");
    } catch (err) {
      setResetMessage(err?.message || "Erro ao enviar e-mail de recuperação.");
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <div className="page-anim min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-primary-50/30 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-10">
          <div className="flex flex-col items-center mb-8">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center mb-5 shadow-lg shadow-primary/20">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bem-vindo de volta</h1>
            <p className="text-sm text-slate-400 mt-1.5">Entre com suas credenciais para continuar</p>
          </div>

          <form onSubmit={fazerLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">E-mail</label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="senha" className="mb-1.5 block text-sm font-medium text-slate-700">Senha</label>
              <div className="relative">
                <input
                  id="senha"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="rounded-xl bg-danger-50 border border-danger-200 px-4 py-3 text-sm text-danger-700 font-medium">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-slate-800 active:bg-slate-950 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={resetSenha}
              disabled={resetLoading}
              className="text-sm text-slate-500 hover:text-primary transition-colors font-medium disabled:opacity-50"
            >
              {resetLoading ? "Enviando..." : "Esqueci minha senha"}
            </button>
            {resetMessage && (
              <p className="mt-2 text-xs text-slate-500">{resetMessage}</p>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Sistema de Agendamento &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
