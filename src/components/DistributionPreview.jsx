export default function DistributionPreview({ preview, onConfirm, onCancel, executing }) {
  if (!preview) return null;
  const { total, porArea, porTipo, distribuicao, warnings } = preview;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Prévia da Distribuição</h2>
            <p className="text-xs text-slate-400 mt-0.5">Confirme os dados antes de distribuir</p>
          </div>
          <button onClick={onCancel} disabled={executing} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition" aria-label="Fechar">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {warnings?.length > 0 && (
            <div className="rounded-xl bg-warning-50 border border-warning-200 p-4">
              <p className="text-sm font-semibold text-warning-700 mb-2">Avisos</p>
              <ul className="space-y-1">{warnings.map((w, i) => <li key={i} className="text-sm text-warning-600">&bull; {w}</li>)}</ul>
            </div>
          )}

          <div className="text-center py-2">
            <span className="text-4xl font-extrabold text-slate-900 tabular-nums">{total}</span>
            <p className="text-sm text-slate-400 mt-1">atividades para distribuir</p>
          </div>

          {Object.keys(porArea || {}).length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Por Área</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(porArea).map(([area, qtd]) => (
                  <div key={area} className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-center">
                    <span className="text-lg font-bold text-slate-800 tabular-nums">{qtd}</span>
                    <p className="text-2xs text-slate-400 font-medium">{area}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {Object.keys(porTipo || {}).length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Por Tipo</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(porTipo).map(([tipo, qtd]) => (
                  <div key={tipo} className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-center">
                    <span className="text-lg font-bold text-slate-800 tabular-nums">{qtd}</span>
                    <p className="text-2xs text-slate-400 font-medium">{tipo}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {distribuicao?.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Por Atendente</h3>
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50/80 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Atendente</th>
                      <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Qtd</th>
                      <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {distribuicao.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-2.5 font-semibold text-slate-800">{d.nome}</td>
                        <td className="px-4 py-2.5 text-center font-bold text-slate-900 tabular-nums">{d.quantidade}</td>
                        <td className="px-4 py-2.5 text-center text-slate-500 tabular-nums">{d.percentual}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex justify-end gap-3">
          <button onClick={onCancel} disabled={executing} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all duration-200 disabled:opacity-50">
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={executing || total === 0 || distribuicao?.length === 0} className="rounded-xl bg-success-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-success-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]">
            {executing ? "Distribuindo..." : "Confirmar Distribuição"}
          </button>
        </div>
      </div>
    </div>
  );
}
