export default function DistributionPreview({ preview, onConfirm, onCancel, executing }) {
  if (!preview) return null;

  const { total, porArea, porTipo, distribuicao, warnings } = preview;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onCancel}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-xl font-bold text-slate-900">Prévia da Distribuição</h2>
          <p className="text-sm text-slate-500 mt-1">Confirme os dados antes de distribuir</p>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Warnings */}
          {warnings?.length > 0 && (
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
              <p className="text-sm font-semibold text-amber-800 mb-2">⚠ Avisos</p>
              <ul className="space-y-1">
                {warnings.map((w, i) => (
                  <li key={i} className="text-sm text-amber-700">• {w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Total */}
          <div className="text-center">
            <span className="text-4xl font-extrabold text-slate-900">{total}</span>
            <p className="text-sm text-slate-500 mt-1">atividades para distribuir</p>
          </div>

          {/* Por Área */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Por Área</h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(porArea || {}).map(([area, qtd]) => (
                <div key={area} className="rounded-xl bg-slate-100 px-4 py-2 text-center min-w-[80px]">
                  <span className="text-lg font-bold text-slate-900">{qtd}</span>
                  <p className="text-xs text-slate-500">{area}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Por Tipo */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Por Tipo de Atividade</h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(porTipo || {}).map(([tipo, qtd]) => (
                <div key={tipo} className="rounded-xl bg-slate-100 px-4 py-2 text-center min-w-[80px]">
                  <span className="text-lg font-bold text-slate-900">{qtd}</span>
                  <p className="text-xs text-slate-500">{tipo}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Distribuição por Atendente */}
          {distribuicao?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Distribuição por Atendente</h3>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold">Atendente</th>
                      <th className="px-4 py-2 text-center font-semibold">Quantidade</th>
                      <th className="px-4 py-2 text-center font-semibold">Percentual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {distribuicao.map((d) => (
                      <tr key={d.id} className="border-t border-slate-100">
                        <td className="px-4 py-2 font-medium text-slate-900">{d.nome}</td>
                        <td className="px-4 py-2 text-center font-bold text-slate-900">{d.quantidade}</td>
                        <td className="px-4 py-2 text-center text-slate-600">{d.percentual}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={executing}
            className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={executing || total === 0 || distribuicao?.length === 0}
            className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {executing ? "Distribuindo..." : "Confirmar Distribuição"}
          </button>
        </div>
      </div>
    </div>
  );
}
