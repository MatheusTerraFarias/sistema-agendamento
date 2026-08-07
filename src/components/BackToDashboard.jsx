import { useLocation, useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";

export default function BackToDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === "/dashboard") return null;

  return (
    <button
      onClick={() => navigate("/dashboard")}
      aria-label="Voltar ao painel"
      className="fixed bottom-6 right-6 z-50 group flex items-center gap-2.5 bg-slate-900 text-white pl-3.5 pr-5 py-2.5 rounded-2xl shadow-xl hover:shadow-2xl hover:bg-slate-800 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97] border border-white/10"
    >
      <div className="h-7 w-7 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition">
        <FaHome size={13} />
      </div>
      <span className="text-sm font-semibold">Painel</span>
    </button>
  );
}
