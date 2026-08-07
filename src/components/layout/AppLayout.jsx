import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAgendamentos } from "../../hooks/useAgendamentos";

export default function AppLayout() {
  const { profile } = useAgendamentos();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/50">
      <Sidebar profile={profile} />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
