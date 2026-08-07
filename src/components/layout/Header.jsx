import { useState, useRef, useEffect } from "react";
import { FaSearch, FaBell } from "react-icons/fa";

export default function Header({ title = "Dashboard", subtitle, session, profile }) {
  const [query, setQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notifRef = useRef(null);

  const userName = profile?.nome || session?.user?.email?.split("@")[0] || "Usuário";
  const userInitial = userName.charAt(0).toUpperCase();

  const formatRole = (perfil) => {
    if (!perfil) return "Atendente";
    const map = { admin: "Admin", supervisor: "Supervisor", supervisora: "Supervisora", atendente: "Atendente" };
    return map[String(perfil).toLowerCase()] || perfil;
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    }
    if (notificationsOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notificationsOpen]);

  return (
    <header className="sticky top-0 z-40 flex w-full min-w-0 items-center justify-between gap-4 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl px-6 py-3">
      <div className="min-w-0">
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:block">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar..."
            className="w-56 rounded-xl border border-slate-200 bg-slate-50/80 py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 focus:outline-none transition-all duration-200"
            aria-label="Pesquisar"
          />
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen((v) => !v)}
            aria-expanded={notificationsOpen}
            aria-label="Notificações"
            className="relative p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200"
          >
            <FaBell size={16} />
            <span className="absolute top-2 right-2 h-2 w-2 bg-danger rounded-full ring-2 ring-white" />
          </button>
          {notificationsOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl animate-scale-in">
              <p className="font-bold text-slate-900 text-sm">Notificações</p>
              <div className="mt-3 py-6 text-center">
                <FaBell className="mx-auto text-slate-300 mb-2" size={24} />
                <p className="text-sm text-slate-400">Nenhuma notificação nova</p>
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
            {userInitial}
          </div>
          <div className="hidden lg:block">
            <div className="text-sm font-semibold text-slate-800 leading-tight">{userName}</div>
            <div className="text-2xs text-slate-400 font-medium">{formatRole(profile?.perfil)}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
