import {
  FaHome,
  FaUsers,
  FaCalendarAlt,
  FaFileImport,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  async function logout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  return (
    <div className="flex min-h-screen">

      {/* Sidebar */}
      <aside className="w-64 bg-[#09124f] text-white p-5">

        <h1 className="text-2xl font-bold mb-10">
          Agendamento
        </h1>

        <nav className="flex flex-col gap-2">

          <button className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#1c2a7a] transition">
            <FaHome />
            Dashboard
          </button>

          <button className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#1c2a7a] transition">
            <FaUsers />
            Clientes
          </button>

          <button className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#1c2a7a] transition">
            <FaCalendarAlt />
            Agendamentos
          </button>

          <button className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#1c2a7a] transition">
            <FaFileImport />
            Importar XLSX
          </button>

          <button className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#1c2a7a] transition">
            <FaCog />
            Configurações
          </button>

        </nav>

        <div className="mt-auto pt-10">

          <button
            onClick={logout}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-600 transition w-full"
          >
            <FaSignOutAlt />
            Sair
          </button>

        </div>

      </aside>

      {/* Conteúdo */}
      <main className="flex-1 bg-slate-100 p-8">

        <h1 className="text-3xl font-bold mb-6">
          Dashboard
        </h1>

        <div className="grid grid-cols-3 gap-6">

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-gray-500">
              Clientes
            </h2>

            <p className="text-3xl font-bold mt-2">
              0
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-gray-500">
              Agendamentos
            </h2>

            <p className="text-3xl font-bold mt-2">
              0
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-gray-500">
              Concluídos
            </h2>

            <p className="text-3xl font-bold mt-2">
              0
            </p>
          </div>

        </div>

      </main>

    </div>
  );
}