export const STATUS_OPTIONS = [
  { value: "confirmado", label: "Confirmado" },
  { value: "concluido", label: "Concluido" },
  { value: "nao_concluido", label: "Nao Concluido" },
  { value: "normalizado", label: "Normalizado" },
  { value: "mensagem", label: "Mensagem" },
  { value: "sem_contato", label: "Sem contato" },
  { value: "tratar_os", label: "Tratar OS" },
  { value: "outra_area", label: "Outra area" },
  { value: "outros", label: "Outros" },
];

export const STATUS_LABELS = Object.fromEntries(STATUS_OPTIONS.map((item) => [item.value, item.label]));

export const STATUS_BADGES = {
  confirmado: "bg-success-50 text-success-700 ring-1 ring-success-200/60",
  concluido: "bg-primary-50 text-primary-700 ring-1 ring-primary-200/60",
  nao_concluido: "bg-slate-100 text-slate-600 ring-1 ring-slate-300/60",
  normalizado: "bg-slate-100 text-slate-700 ring-1 ring-slate-300/60",
  mensagem: "bg-warning-50 text-warning-700 ring-1 ring-warning-200/60",
  sem_contato: "bg-danger-50 text-danger-700 ring-1 ring-danger-200/60",
  tratar_os: "bg-orange-50 text-orange-700 ring-1 ring-orange-200/60",
  outra_area: "bg-purple-50 text-purple-700 ring-1 ring-purple-200/60",
  outros: "bg-slate-100 text-slate-600 ring-1 ring-slate-300/60",
};

export function normalizeStatus(value) {
  const raw = String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  if (!raw) return "tratar_os";
  if (raw.includes("confirmado")) return "confirmado";
  if (raw.includes("concluido") || raw.includes("concluida")) return "concluido";
  if (raw.includes("normalizado")) return "normalizado";
  if (raw.includes("mensagem")) return "mensagem";
  if (raw.includes("sem contato")) return "sem_contato";
  if (raw.includes("tratar")) return "tratar_os";
  if (raw.includes("outra area")) return "outra_area";
  if (raw.includes("outros")) return "outros";
  return raw.replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "tratar_os";
}
