import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaCalendarAlt, FaUsers, FaFileImport, FaCog, FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function Sidebar({ profile }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const items = [
    { to: "/dashboard", label: "Dashboard", icon: FaHome },
    { to: "/agendamentos", label: "Agendamentos", icon: FaCalendarAlt },
    { to: "/clientes", label: "Clientes", icon: FaUsers },
    { to: "/importar", label: "Importação", icon: FaFileImport },
    { to: "/configuracoes", label: "Configurações", icon: FaCog },
  ];

  return (
    <aside className={`${collapsed ? "w-20" : "w-64"} shrink-0 bg-slate-950 text-white flex flex-col h-screen sticky top-0 shadow-lg transition-all duration-300`}>
      {/* Logo / Header */}
      <div className={`px-4 py-6 flex items-center gap-3 border-b border-white/10 ${collapsed ? "justify-center" : "justify-between"}`}>
        <div className="h-10 w-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 hover:bg-white/20 transition">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
            <path d="M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm truncate">Agenda</div>
            <div className="text-xs text-white/70 truncate">CRM</div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-white/10 rounded-lg transition text-white/80 hover:text-white"
          title={collapsed ? "Expandir" : "Colapsar"}
        >
          {collapsed ? <FaChevronRight size={14} /> : <FaChevronLeft size={14} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm whitespace-nowrap ${
                active
                  ? "bg-white/20 text-white shadow-md"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
              title={collapsed ? item.label : ""}
            >
              <Icon className="flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User */}
      <div className={`px-3 py-4 border-t border-primary-400 ${collapsed ? "flex justify-center" : ""}`}>
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold flex-shrink-0">
            {profile?.nome?.charAt(0)?.toUpperCase() || "U"}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold truncate">{profile?.nome || "Usuário"}</div>
              <div className="text-xs text-white/70 truncate">{profile?.perfil ? String(profile.perfil).charAt(0).toUpperCase() + String(profile.perfil).slice(1) : "Atendente"}</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
