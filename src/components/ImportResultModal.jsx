export default function ImportResultModal({ report, onClose }) {
  if (!report) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-8">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl">
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

        <div className="grid gap-4 sm:grid-cols-5 mb-6">
          <div className="rounded-3xl bg-slate-50 p-5 text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Total</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{report.total}</p>
          </div>
          <div className="rounded-3xl bg-emerald-50 p-5 text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-700">Novos</p>
            <p className="mt-3 text-3xl font-semibold text-emerald-900">{report.novos}</p>
          </div>
          <div className="rounded-3xl bg-sky-50 p-5 text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-sky-700">Atualizados</p>
            <p className="mt-3 text-3xl font-semibold text-sky-900">{report.atualizados}</p>
          </div>
          <div className="rounded-3xl bg-amber-50 p-5 text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-amber-700">Ignorados</p>
            <p className="mt-3 text-3xl font-semibold text-amber-900">{report.ignorados}</p>
          </div>
          <div className="rounded-3xl bg-rose-50 p-5 text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-rose-700">Erros</p>
            <p className="mt-3 text-3xl font-semibold text-rose-900">{report.erros}</p>
          </div>
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
    </div>
  );
}
