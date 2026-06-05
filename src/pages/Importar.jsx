import ImportPreview from "../components/ImportPreview";
import ImportResultModal from "../components/ImportResultModal";
import ImportUpload from "../components/ImportUpload";
import { useImportacao } from "../hooks/useImportacao";

export default function Importar() {
  const {
    fileName,
    uploadDate,
    rowCount,
    previewRows,
    validationError,
    loading,
    processing,
    progress,
    report,
    showReport,
    error,
    handleFileChange,
    processImport,
    cancelImport,
    resetState,
  } = useImportacao();

  return (
    <div className="page-anim min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Importar XLSX</h1>
              <p className="mt-2 text-slate-600">
                Faça upload de sua base diária de chamados e processe os protocolos sem duplicidade com segurança e confiabilidade.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <ImportUpload
              fileName={fileName}
              uploadDate={uploadDate}
              rowCount={rowCount}
              validationError={validationError}
              loading={loading}
              processing={processing}
              progress={progress}
              onFileChange={handleFileChange}
              onProcess={processImport}
              onCancel={cancelImport}
            />

            {previewRows.length ? <ImportPreview rows={previewRows} /> : null}

            {error ? (
              <div className="rounded-3xl bg-rose-50 border border-rose-200 p-6 text-sm text-rose-700">
                <strong>Erro:</strong> {error}
              </div>
            ) : null}
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-sm h-fit">
            <h2 className="text-2xl font-bold text-slate-900">Como funciona</h2>
            <ul className="mt-6 space-y-4 text-slate-700 text-sm leading-relaxed">
              <li className="flex gap-3">
                <span className="font-bold text-primary min-w-6">1.</span>
                <span>Faça upload de um arquivo .xlsx ou .xls com seus chamados.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary min-w-6">2.</span>
                <span>O sistema valida colunas obrigatórias e mapeia nomes alternativos automaticamente.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary min-w-6">3.</span>
                <span>Registros novos são criados, existentes atualizados, finalizados/cancelados ignorados.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary min-w-6">4.</span>
                <span>Novos agendamentos são distribuídos automaticamente entre atendentes disponíveis.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary min-w-6">5.</span>
                <span>Você recebe um relatório detalhado com sucesso, erros e ações realizadas.</span>
              </li>
            </ul>
          </div>
        </div>

        {showReport ? <ImportResultModal report={report} onClose={resetState} /> : null}
      </div>
    </div>
  );
}
