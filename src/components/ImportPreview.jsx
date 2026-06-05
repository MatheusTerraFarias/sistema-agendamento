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

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
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
                  {isNaN(new Date(row.data_agendamento).getTime())
                    ? String(row.data_agendamento || "-")
                    : new Date(row.data_agendamento).toLocaleDateString()}
                </td>
                {showService ? (
                  <td className="whitespace-nowrap px-4 py-3 text-slate-700">{row.servico_nome || "-"}</td>
                ) : null}
                {showHour ? (
                  <td className="whitespace-nowrap px-4 py-3 text-slate-700">{row.hora_agendamento || "-"}</td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
