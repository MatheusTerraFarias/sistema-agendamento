import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Agendamentos from "./pages/Agendamentos";
import Clientes from "./pages/Clientes";
import Configuracoes from "./pages/Configuracoes";
import Distribuicao from "./pages/Distribuicao";
import Importar from "./pages/Importar";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

function App() {
  return (
    <BrowserRouter>
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
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/importar" element={<Importar />} />
          <Route path="/distribuicao" element={<Distribuicao />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
