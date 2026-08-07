import { useAgendamentosContext } from "../hooks/useAgendamentosContext";
import { Navigate } from "react-router-dom";

const ADMIN_ROLES = ["admin", "supervisor", "supervisora"];

export function isAdminRole(perfil) {
  return ADMIN_ROLES.includes(String(perfil || "").toLowerCase());
}

export default function RoleProtectedRoute({ children, allowedRoles }) {
  const { profile } = useAgendamentosContext();

  const userRole = (profile?.perfil || "atendente").toLowerCase();

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/agendamentos" replace />;
  }

  return children;
}
