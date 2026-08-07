import { useAgendamentosContext } from "../hooks/useAgendamentosContext";
import ImportPreview from "../components/ImportPreview";
import ImportResultModal from "../components/ImportResultModal";
import ImportUpload from "../components/ImportUpload";
import { useImportacao } from "../hooks/useImportacao";
import { useGoogleSheets } from "../hooks/useGoogleSheets";
import Header from "../components/layout/Header";
import { FaSync, FaGoogle, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

export default function Importar() {
  const { profile } = useAgendamentosContext();
  const { fileName, uploadDate, rowCount, previewRows, validationError, loading, processing, progress, report, showReport, error, handleFileChange, processImport, cancelImport, resetState } = useImportacao();
  const { loading: sheetsLoading, error: sheetsError, rows: sheetsRows, syncedAt, fetchFromAPI, syncToSupabase } = useGoogleSheets();

  const handleSyncFromSheets = async () => {
    await fetchFromAPI();
  };

  const handleSyncToDB = async () => {
    const result = await syncToSupabase();
    if (result) {
      alert(`Sincronizado: ${result.synced} registros. Erros: ${result.errors}`);
    }
  };

  return (
    <>
      <Header title="Importar" subtitle="Importe dados de planilhas ou sincronize com Google Sheets" profile={profile} />
      <div className="page-anim flex-1 overflow-y-auto">
        <div className="mx-auto w-full min-w-0 max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">

          {/* Google Sheets Sync */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-success-50 flex items-center justify-center">
                <FaGoogle className="text-success-600" size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Sincronizar com Google Sheets</h2>
                <p className="text-xs text-slate-400">Puxe dados atualizados da planilha de acompanhamento</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSyncFromSheets}
                disabled={sheetsLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-all duration-200 disabled:opacity-50 active:scale-[0.98]"
              >
                <FaSync size={14} className={sheetsLoading ? "animate-spin" : ""} />
                {sheetsLoading ? "Sincronizando..." : "Buscar da Planilha"}
              </button>

              {sheetsRows.length > 0 && (
                <button
                  onClick={handleSyncToDB}
                  disabled={sheetsLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-success-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-success-700 transition-all duration-200 disabled:opacity-50 active:scale-[0.98]"
                >
                  <FaCheckCircle size={14} />
                  Salvar no Sistema ({sheetsRows.length} registros)
                </button>
              )}
            </div>

            {syncedAt && (
              <p className="mt-3 text-xs text-slate-400">
                Última sincronização: {syncedAt.toLocaleString("pt-BR")}
              </p>
            )}

            {sheetsError && (
              <div className="mt-3 rounded-xl bg-danger-50 border border-danger-200 px-4 py-3 text-sm text-danger-700 flex items-center gap-2">
                <FaExclamationTriangle size={14} />
                {sheetsError}
              </div>
            )}

            {sheetsRows.length > 0 && (
              <div className="mt-4 max-h-64 overflow-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-slate-500">OS</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-500">Cliente</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-500">Status</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-500">Data</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-500">Atendente</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sheetsRows.slice(0, 20).map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-mono font-semibold text-slate-700">{row.protocolo || "—"}</td>
                        <td className="px-3 py-2 text-slate-600 max-w-[200px] truncate">{row.cliente_nome || "—"}</td>
                        <td className="px-3 py-2">
                          <span className={`inline-flex rounded-lg px-2 py-0.5 text-xs font-bold ${
                            row.status === "finalizado" ? "bg-success-50 text-success-700" :
                            row.status === "em_andamento" ? "bg-warning-50 text-warning-700" :
                            row.status === "cancelado" ? "bg-danger-50 text-danger-700" :
                            "bg-primary-50 text-primary-700"
                          }`}>
                            {row.status || "—"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-slate-500">{row.data_agendamento || "—"}</td>
                        <td className="px-3 py-2 text-slate-500">{row.atendente_nome || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {sheetsRows.length > 20 && (
                  <p className="px-3 py-2 text-xs text-slate-400 text-center">
                    Mostrando 20 de {sheetsRows.length} registros
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Upload XLSX */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-card p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Ou importe manualmente</h2>
            <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
              <div className="min-w-0 space-y-6">
                <ImportUpload fileName={fileName} uploadDate={uploadDate} rowCount={rowCount} validationError={validationError} loading={loading} processing={processing} progress={progress} onFileChange={handleFileChange} onProcess={processImport} onCancel={cancelImport} />
                {previewRows.length > 0 && <ImportPreview rows={previewRows} />}
                {error && <div className="rounded-2xl bg-danger-50 border border-danger-200 p-5 text-sm text-danger-700"><strong>Erro:</strong> {error}</div>}
              </div>

              <div className="h-fit min-w-0 rounded-2xl bg-slate-50 border border-slate-200 p-6">
                <h3 className="text-sm font-bold text-slate-700 mb-3">Como funciona</h3>
                <ul className="space-y-3 text-xs text-slate-600 leading-relaxed">
                  {[
                    "Faça upload de um arquivo .xlsx ou .xls com seus chamados.",
                    "O sistema valida colunas obrigatórias e mapeia nomes automaticamente.",
                    "Registros novos são criados, existentes atualizados.",
                    "Você recebe um relatório detalhado com sucesso e erros.",
                  ].map((text, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary text-2xs font-bold">{i + 1}</span>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {showReport && <ImportResultModal report={report} onClose={resetState} />}
        </div>
      </div>
    </>
  );
}
