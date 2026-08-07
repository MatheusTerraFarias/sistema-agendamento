import { createContext, useContext } from "react";
import { useAgendamentos } from "../hooks/useAgendamentos";

const AgendamentosContext = createContext(null);

export function AgendamentosProvider({ children }) {
  const value = useAgendamentos();
  return (
    <AgendamentosContext.Provider value={value}>
      {children}
    </AgendamentosContext.Provider>
  );
}

export function useAgendamentosContext() {
  const ctx = useContext(AgendamentosContext);
  if (!ctx) throw new Error("useAgendamentosContext must be used within AgendamentosProvider");
  return ctx;
}
