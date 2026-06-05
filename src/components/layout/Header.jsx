import { useState } from "react";
import { FaSearch, FaBell, FaSignOutAlt } from "react-icons/fa";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function Header({ title = "Dashboard", session, profile }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  };

  const userName = profile?.nome || session?.user?.email?.split("@")[0] || "Usuário";
  const userInitial = userName.charAt(0).toUpperCase();

  const formatRole = (perfil) => {
    if (!perfil) return "Atendente";
    const normalized = String(perfil).toLowerCase();
    if (normalized === "admin") return "Admin";
    if (normalized === "supervisor") return "Supervisor";
    if (normalized === "supervisora") return "Supervisora";
    if (normalized === "atendente") return "Atendente";
    return perfil;
  };

  const displayRole = formatRole(profile?.perfil);

  return (
    <header className="w-full border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-40">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-500 mt-0.5">Bem-vindo ao Sistema de Agendamento</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden sm:block w-64">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-500 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition group">
            <FaBell size={16} />
            <span className="absolute top-1 right-1 h-2 w-2 bg-rose-500 rounded-full group-hover:scale-125 transition" />
          </button>

          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center text-xs font-semibold text-white">
              {userInitial}
            </div>
            <div className="hidden sm:block text-sm">
              <div className="font-medium text-slate-800">{userName}</div>
              <div className="text-xs text-slate-500">{displayRole}</div>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition disabled:opacity-50 ml-2"
              title="Sair"
            >
              <FaSignOutAlt size={14} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
