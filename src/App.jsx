import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Agendamentos from "./pages/Agendamentos";
import Configuracoes from "./pages/Configuracoes";
import Distribuicao from "./pages/Distribuicao";
import Importar from "./pages/Importar";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import { AgendamentosProvider } from "./hooks/useAgendamentosContext";

const ADMIN_ROLES = ["admin", "supervisor", "supervisora"];

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AgendamentosProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/agendamentos" element={<Agendamentos />} />
              <Route
                path="/importar"
                element={
                  <RoleProtectedRoute allowedRoles={ADMIN_ROLES}>
                    <Importar />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/distribuicao"
                element={
                  <RoleProtectedRoute allowedRoles={ADMIN_ROLES}>
                    <Distribuicao />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/configuracoes"
                element={
                  <RoleProtectedRoute allowedRoles={ADMIN_ROLES}>
                    <Configuracoes />
                  </RoleProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </AgendamentosProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
