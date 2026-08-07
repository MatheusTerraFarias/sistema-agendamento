import ImportPreview from "../components/ImportPreview";
import ImportResultModal from "../components/ImportResultModal";
import ImportUpload from "../components/ImportUpload";
import { useImportacao } from "../hooks/useImportacao";
import Header from "../components/layout/Header";

export default function Importar() {
  const { fileName, uploadDate, rowCount, previewRows, validationError, loading, processing, progress, report, showReport, error, handleFileChange, processImport, cancelImport, resetState } = useImportacao();

  return (
    <>
      <Header title="Importar XLSX" subtitle="Faça upload de sua base diária de chamados" />
      <div className="page-anim flex-1 overflow-y-auto">
        <div className="mx-auto w-full min-w-0 max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div className="min-w-0 space-y-6">
              <ImportUpload fileName={fileName} uploadDate={uploadDate} rowCount={rowCount} validationError={validationError} loading={loading} processing={processing} progress={progress} onFileChange={handleFileChange} onProcess={processImport} onCancel={cancelImport} />
              {previewRows.length > 0 && <ImportPreview rows={previewRows} />}
              {error && <div className="rounded-2xl bg-danger-50 border border-danger-200 p-5 text-sm text-danger-700"><strong>Erro:</strong> {error}</div>}
            </div>

            <div className="h-fit min-w-0 rounded-2xl bg-white border border-slate-200 shadow-card p-6">
              <h2 className="text-lg font-bold text-slate-900">Como funciona</h2>
              <ul className="mt-5 space-y-4 text-sm text-slate-600 leading-relaxed">
                {[
                  "Faça upload de um arquivo .xlsx ou .xls com seus chamados.",
                  "O sistema valida colunas obrigatórias e mapeia nomes alternativos automaticamente.",
                  "Registros novos são criados, existentes atualizados, finalizados/cancelados ignorados.",
                  "Novos agendamentos são distribuídos automaticamente entre atendentes disponíveis.",
                  "Você recebe um relatório detalhado com sucesso, erros e ações realizadas.",
                ].map((text, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary text-xs font-bold">{i + 1}</span>
                    <span className="pt-0.5">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {showReport && <ImportResultModal report={report} onClose={resetState} />}
        </div>
      </div>
    </>
  );
}
