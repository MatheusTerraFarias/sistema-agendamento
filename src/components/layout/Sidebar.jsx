import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaCalendarAlt,
  FaUsers,
  FaFileImport,
  FaCog,
  FaChevronLeft,
  FaChevronRight,
  FaRandom,
  FaSignOutAlt,
} from "react-icons/fa";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: FaHome, roles: ["admin", "supervisor", "supervisora", "atendente"] },
  { to: "/agendamentos", label: "Agendamentos", icon: FaCalendarAlt, roles: ["admin", "supervisor", "supervisora", "atendente"] },
  { to: "/clientes", label: "Clientes", icon: FaUsers, roles: ["admin", "supervisor", "supervisora", "atendente"] },
  { to: "/importar", label: "Importação", icon: FaFileImport, roles: ["admin", "supervisor", "supervisora"] },
  { to: "/distribuicao", label: "Distribuição", icon: FaRandom, roles: ["admin", "supervisor", "supervisora"] },
  { to: "/configuracoes", label: "Configurações", icon: FaCog, roles: ["admin", "supervisor", "supervisora"] },
];

export default function Sidebar({ profile }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const userRole = (profile?.perfil || "atendente").toLowerCase();
  const visibleItems = navItems.filter((item) => item.roles.includes(userRole));

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  };

  const userName = profile?.nome || "Usuário";
  const userInitial = userName.charAt(0).toUpperCase();
  const role = profile?.perfil
    ? String(profile.perfil).charAt(0).toUpperCase() + String(profile.perfil).slice(1)
    : "Atendente";

  return (
    <aside
      className={`${collapsed ? "w-[72px]" : "w-64"} shrink-0 bg-slate-950 text-white flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out z-50`}
    >
      {/* Logo */}
      <div className={`px-4 h-16 flex items-center gap-3 border-b border-white/[0.06] ${collapsed ? "justify-center px-0" : ""}`}>
        <div className="h-9 w-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="font-bold text-sm tracking-tight">Agenda</div>
            <div className="text-2xs text-white/50 font-medium">CRM</div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`${collapsed ? "absolute -right-3 top-5" : "ml-auto"} h-6 w-6 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110`}
          title={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
          aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
        >
          {collapsed ? <FaChevronRight size={10} className="text-white/70" /> : <FaChevronLeft size={10} className="text-white/70" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" role="navigation" aria-label="Menu principal">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-white/[0.12] text-white shadow-sm"
                  : "text-white/60 hover:text-white hover:bg-white/[0.06]"
              } ${collapsed ? "justify-center px-2" : ""}`}
              title={collapsed ? item.label : ""}
              aria-current={active ? "page" : undefined}
            >
              <Icon
                size={18}
                className={`shrink-0 transition-colors ${active ? "text-white" : "text-white/50 group-hover:text-white/80"}`}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {active && !collapsed && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-400 shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-white/[0.06] p-3">
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
            {userInitial}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-white truncate">{userName}</div>
              <div className="text-2xs text-white/40 font-medium">{role}</div>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
              title="Sair"
              aria-label="Sair da conta"
            >
              <FaSignOutAlt size={14} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
