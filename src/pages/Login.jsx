import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function fazerLogin(e) {
    e.preventDefault();

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center animated-gradient">
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
            className="w-full bg-[#09124f] text-white p-3 rounded-lg hover:bg-[#0d1868] transition"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

        </form>
      </div>
    </div>
  );
}