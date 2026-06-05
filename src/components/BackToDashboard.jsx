import { useLocation, useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";

export default function BackToDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  // hide on the dashboard itself
  if (location.pathname === "/dashboard") return null;

  return (
    <button
      onClick={() => navigate("/dashboard")}
      aria-label="Voltar ao painel"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#09124f] text-white px-4 py-2 rounded-full shadow-lg hover:bg-[#0d1868] transition transform-gpu hover:-translate-y-1 active:translate-y-0 disabled:opacity-60"
    >
      <FaHome />
      <span className="text-sm font-semibold">Painel</span>
    </button>
  );
}
