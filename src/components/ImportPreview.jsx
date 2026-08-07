function formatPreviewDate(value) {
  if (value === undefined || value === null || String(value).trim() === "") return "";
  if (typeof value === "number") {
    if (value < 1) return "";
    const date = new Date(Math.round((value - 25569) * 86400000));
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
  }
  const normalized = String(value).trim();
  const match = normalized.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (match) { const [, day, month, year] = match; return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year.length === 2 ? "20" + year : year}`; }
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? normalized : date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

function formatPreviewTime(value) {
  if (value === undefined || value === null || String(value).trim() === "") return "";
  if (typeof value === "number") { const minutes = Math.round((((value % 1) + 1) % 1) * 1440) % 1440; return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`; }
  const match = String(value).trim().match(/^(\d{1,2}):(\d{2})/);
  return match ? `${match[1].padStart(2, "0")}:${match[2]}` : String(value).trim();
}

export default function ImportPreview({ rows }) {
  const showService = rows.some((row) => Boolean(row.servico_nome));
  const showHour = rows.some((row) => Boolean(row.hora_agendamento));

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-card p-6 sm:p-8">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-900">Pré-visualização</h2>
        <p className="mt-1 text-sm text-slate-400">Confira os primeiros registros lidos da planilha antes de importar</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[720px] divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50/80">
            <tr>
              {["Protocolo", "Cliente", "Telefone", "Status", "Data agendamento", showService && "Serviço", showHour && "Hora"].filter(Boolean).map((h) => (
                <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                <td className="whitespace-nowrap px-4 py-3 text-slate-700 font-medium">{row.protocolo}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-700">{row.cliente_nome}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500 tabular-nums">{row.telefone}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-700">{row.status}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600 tabular-nums">{formatPreviewDate(row.data_agendamento) || "—"}</td>
                {showService && <td className="whitespace-nowrap px-4 py-3 text-slate-600">{row.servico_nome || "—"}</td>}
                {showHour && <td className="whitespace-nowrap px-4 py-3 text-slate-600 tabular-nums">{formatPreviewTime(row.hora_agendamento) || "—"}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
