// Classificação de status das ordens de serviço.

export function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export const CLASS_LABELS = Object.freeze({
  concluida: "Concluída",
  nao_concluida: "Não concluída",
  suspensa: "Suspensa",
  em_andamento: "Em andamento",
  finalizada: "Finalizada",
  cancelada: "Cancelada",
  pendente: "Pendente",
  desconhecido: "Desconhecido",
});

export const TERMINAL_CLASSES = Object.freeze([
  "concluida",
  "finalizada",
  "cancelada",
]);

export function isTerminalClass(klass) {
  return TERMINAL_CLASSES.includes(klass);
}

export function classifyRawStatus(rawValue) {
  const text = normalizeText(rawValue);
  if (!text) return "desconhecido";
  if (text.includes("nao conclu")) return "nao_concluida";
  if (text.includes("conclu")) return "concluida";
  if (text.includes("finaliz")) return "finalizada";
  if (text.includes("suspens")) return "suspensa";
  if (text.includes("cancel")) return "cancelada";
  if (text.includes("andamento") || text.includes("inici")) return "em_andamento";
  if (text.includes("pendent") || text.includes("novo") || text.includes("abert")) return "pendente";
  return "desconhecido";
}

// Ordem com técnico em campo não precisa de contato do atendente.
// Terminal (concluída/finalizada/cancelada) também não precisa.
// Não concluída, suspensa, pendente e desconhecida precisam de contato.
export function needsContact(klass) {
  if (isTerminalClass(klass)) return false;
  if (klass === "em_andamento") return false;
  return true;
}

// Cruza com o sistema de agendamento: se a planilha ainda não indica status
// terminal, mas o agendamento já foi encerrado, prevalece o agendamento.
export function resolveClass(rawClass, agendamento) {
  if (!agendamento) return rawClass;
  if (isTerminalClass(rawClass)) return rawClass;
  const sysStatus = normalizeText(agendamento.status);
  if (sysStatus === "finalizado" || sysStatus === "concluido" || sysStatus === "concluida") {
    return "finalizada";
  }
  if (sysStatus === "cancelado" || sysStatus === "cancelada") {
    return "cancelada";
  }
  return rawClass;
}

export function buildDetail(klass, agendamento, technicianNames) {
  if (!agendamento) return "Não encontrada no sistema de agendamento";
  const assignedId = agendamento.distribuido_para || agendamento.criado_por || null;
  const techName = assignedId ? technicianNames?.get(assignedId) : null;
  const sysStatus = normalizeText(agendamento.status);

  if (isTerminalClass(klass)) return "Encerrada no sistema de agendamento";
  if (sysStatus === "em_andamento") {
    return techName ? `Técnico em campo: ${techName}` : "Técnico em campo";
  }
  if (assignedId) return techName ? `Técnico designado: ${techName}` : "Técnico designado";
  return "Sem técnico designado no agendamento";
}
