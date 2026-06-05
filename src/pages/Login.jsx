import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Navigate, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

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

  useEffect(() => {
    let mounted = true;

    async function verifySession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;
      setHasSession(Boolean(session));
      setSessionChecked(true);
    }

    verifySession();

    return () => {
      mounted = false;
    };
  }, []);

  if (sessionChecked && hasSession) {
    return <Navigate to="/dashboard" replace />;
  }

  async function fazerLogin(e) {
    e.preventDefault();

    if (!email || !senha) {
      setLoginError("Informe e-mail e senha para entrar.");
      return;
    }

    setLoading(true);
    setLoginError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) {
        setLoginError(error.message);
        return;
      }

      if (!data?.session) {
        setLoginError("Não foi possível iniciar sessão. Tente novamente.");
        return;
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setLoginError(err?.message || "Erro inesperado ao fazer login.");
    } finally {
      setLoading(false);
    }
  }

  async function resetSenha() {
    if (!email) {
      setResetMessage("Informe seu e-mail para resetar a senha.");
      return;
    }

    setResetLoading(true);
    setResetMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset`,
    });

    setResetLoading(false);

    if (error) {
      setResetMessage(error.message);
    } else {
      setResetMessage("E-mail de recuperação enviado com sucesso.");
    }
  }

  return (
    <div className="page-anim min-h-screen flex items-center justify-center animated-gradient">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg">

            <div className="flex flex-col items-center mb-6">
            <img
                src={logo}
                alt="Logo"
                className="h-20 w-auto mb-4"
            />

            <h1 className="text-3xl font-bold text-[#09124f]">
                Sistema de Agendamento
            </h1>

            <p className="text-gray-500 mt-2">
                Faça login para continuar
            </p>
            </div>

        <form onSubmit={fazerLogin} className="space-y-4">

          <input
            type="email"
            placeholder="E-mail"
            className="w-full border rounded-lg p-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Senha"
            className="w-full border rounded-lg p-3"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#09124f] text-white p-3 rounded-lg hover:bg-[#0d1868] transition disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          {loginError ? (
            <p className="mt-3 text-sm text-rose-600">{loginError}</p>
          ) : null}
        </form>

        <div className="mt-4 text-center text-sm text-slate-700">
          <button
            type="button"
            onClick={resetSenha}
            disabled={resetLoading}
            className="font-semibold text-slate-900 underline transition hover:text-slate-700"
          >
            {resetLoading ? "Enviando e-mail..." : "Esqueci minha senha"}
          </button>
          {resetMessage ? <p className="mt-3 text-slate-600">{resetMessage}</p> : null}
        </div>
      </div>
    </div>
  );
}