import { createPortal } from "react-dom";

const SUMMARY_CARDS = [
  { label: "Total", key: "total", bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-800", labelColor: "text-slate-400" },
  { label: "Novos", key: "novos", bg: "bg-success-50", border: "border-success-200", text: "text-success-700", labelColor: "text-success-500" },
  { label: "Atualizados", key: "atualizados", bg: "bg-primary-50", border: "border-primary-200", text: "text-primary-700", labelColor: "text-primary-500" },
  { label: "Ignorados", key: "ignorados", bg: "bg-warning-50", border: "border-warning-200", text: "text-warning-700", labelColor: "text-warning-500" },
  { label: "Erros", key: "erros", bg: "bg-danger-50", border: "border-danger-200", text: "text-danger-700", labelColor: "text-danger-500" },
];

export default function ImportResultModal({ report, onClose }) {
  if (!report) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 backdrop-blur-sm px-4 py-4 sm:py-8" onClick={onClose}>
      <div className="my-auto w-full max-w-2xl rounded-2xl bg-white shadow-2xl sm:p-8 p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Importação concluída</h2>
            <p className="mt-1 text-sm text-slate-400">Resultado do processamento</p>
          </div>
          <button onClick={onClose} className="shrink-0 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-all duration-200 active:scale-[0.98]">
            Fechar
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-4 mb-6">
          {SUMMARY_CARDS.map((card) => (
            <div key={card.key} className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-4 text-center ${card.bg} ${card.border}`}>
              <p className={`text-2xs font-semibold uppercase tracking-wider ${card.labelColor}`}>{card.label}</p>
              <p className={`text-2xl font-bold tabular-nums ${card.text}`}>{report[card.key]}</p>
            </div>
          ))}
        </div>

        {report.errorDetails?.length > 0 && (
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Detalhes</h3>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-600 max-h-48 overflow-y-auto">
              {report.errorDetails.slice(0, 10).map((item, i) => <li key={i}>{item}</li>)}
              {report.errorDetails.length > 10 && <li className="text-slate-400">...e mais {report.errorDetails.length - 10} itens</li>}
            </ul>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
