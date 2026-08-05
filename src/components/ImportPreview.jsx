function formatPreviewDate(value) {
  if (value === undefined || value === null || String(value).trim() === "") return "";

  if (typeof value === "number") {
    if (value < 1) return "";
    const date = new Date(Math.round((value - 25569) * 86400000));
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
  }

  const normalized = String(value).trim();
  const match = normalized.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (match) {
    const [, day, month, year] = match;
    return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year.length === 2 ? `20${year}` : year}`;
  }

  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? normalized : date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

function formatPreviewTime(value) {
  if (value === undefined || value === null || String(value).trim() === "") return "";
  if (typeof value === "number") {
    const minutes = Math.round((((value % 1) + 1) % 1) * 1440) % 1440;
    return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
  }
  const match = String(value).trim().match(/^(\d{1,2}):(\d{2})/);
  return match ? `${match[1].padStart(2, "0")}:${match[2]}` : String(value).trim();
}

export default function ImportPreview({ rows }) {
  const showService = rows.some((row) => Boolean(row.servico_nome));
  const showHour = rows.some((row) => Boolean(row.hora_agendamento));

  return (
    <div className="rounded-3xl bg-white p-8 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Pré-visualização</h2>
          <p className="mt-2 text-slate-500">Confira os primeiros registros lidos da planilha antes de importar.</p>
        </div>
      </div>

      <div className="w-full max-w-full overflow-x-auto">
        <table className="w-full min-w-[720px] divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">Protocolo</th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">Cliente</th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">Telefone</th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">Status</th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">Data agendamento</th>
              {showService ? <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">Serviço</th> : null}
              {showHour ? <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">Hora</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {rows.map((row, index) => (
              <tr key={index}>
                <td className="whitespace-nowrap px-4 py-3 text-slate-700">{row.protocolo}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-700">{row.cliente_nome}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-700">{row.telefone}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-700">{row.status}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                  {formatPreviewDate(row.data_agendamento) || "-"}
                </td>
                {showService ? (
                  <td className="whitespace-nowrap px-4 py-3 text-slate-700">{row.servico_nome || "-"}</td>
                ) : null}
                {showHour ? (
                  <td className="whitespace-nowrap px-4 py-3 text-slate-700">{formatPreviewTime(row.hora_agendamento) || "-"}</td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
