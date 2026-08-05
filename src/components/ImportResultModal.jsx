import { createPortal } from "react-dom";

const SUMMARY_CARDS = [
  ["Total", "total", "bg-slate-50 text-slate-900", "text-slate-500"],
  ["Novos", "novos", "bg-emerald-50 text-emerald-900", "text-emerald-700"],
  ["Atualizados", "atualizados", "bg-sky-50 text-sky-900", "text-sky-700"],
  ["Ignorados", "ignorados", "bg-amber-50 text-amber-900", "text-amber-700"],
  ["Erros", "erros", "bg-rose-50 text-rose-900", "text-rose-700"],
];

export default function ImportResultModal({ report, onClose }) {
  if (!report) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 px-4 py-4 sm:py-8">
      <div className="my-auto w-full max-w-2xl rounded-3xl bg-white p-5 shadow-2xl sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Importação concluída</h2>
            <p className="mt-2 text-slate-500">Veja o resultado do processamento e os registros afetados.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Fechar
          </button>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-4">
          {SUMMARY_CARDS.map(([label, key, colors, titleColor]) => (
            <div key={key} className={`flex h-28 min-w-0 flex-col items-center justify-center gap-1 rounded-3xl px-2 text-center ${colors}`}>
              <p className={`w-full truncate text-xs font-semibold uppercase tracking-[0.08em] ${titleColor}`}>{label}</p>
              <p className="text-4xl font-bold leading-none">{report[key]}</p>
            </div>
          ))}
        </div>

        {report.errorDetails?.length ? (
          <div className="rounded-3xl bg-slate-50 p-5">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Detalhes</h3>
            <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
              {report.errorDetails.slice(0, 8).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
              {report.errorDetails.length > 8 ? (
                <li>...e mais {report.errorDetails.length - 8} itens.</li>
              ) : null}
            </ul>
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
