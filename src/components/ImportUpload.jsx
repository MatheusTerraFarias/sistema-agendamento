import { FaCloudUploadAlt, FaFileExcel, FaSpinner, FaTimes } from "react-icons/fa";
import Button from "./ui/Button";

export default function ImportUpload({
  fileName,
  uploadDate,
  rowCount,
  validationError,
  loading,
  processing,
  progress,
  onFileChange,
  onProcess,
  onCancel,
}) {
  return (
    <div className="rounded-3xl bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Importar base XLSX</h2>
          <p className="mt-2 text-slate-600 max-w-2xl text-sm">
            Faça upload de uma planilha com protocolo, cliente, telefone, status e data de agendamento. Processamos em lotes para máxima segurança.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
          <FaFileExcel /> XLSX / XLS
        </div>
      </div>

      <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center transition hover:border-primary hover:bg-primary/5 relative">
        {!processing && (
          <>
            <FaCloudUploadAlt className="h-10 w-10 text-slate-500" />
            <span className="mt-4 text-lg font-semibold text-slate-900">Arraste o arquivo ou clique para selecionar</span>
            <span className="mt-2 text-sm text-slate-500">Apenas arquivos .xlsx ou .xls são aceitos.</span>
          </>
        )}
        {processing && (
          <div className="flex flex-col items-center gap-4">
            <FaSpinner className="h-8 w-8 text-primary animate-spin" />
            <div>
              <p className="text-lg font-semibold text-slate-900">Processando {rowCount} registros...</p>
              <p className="text-sm text-slate-600 mt-1">{progress}% concluído</p>
            </div>
          </div>
        )}
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={onFileChange}
          disabled={loading || processing}
          className="sr-only"
        />
      </label>

      {validationError && (
        <div className="mt-6 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700 flex items-start gap-3">
          <FaTimes className="flex-shrink-0 mt-0.5" />
          <div>{validationError}</div>
        </div>
      )}

      {fileName && !processing && (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-100 p-4">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500 font-semibold">Arquivo</p>
            <p className="mt-3 text-base font-semibold text-slate-900 truncate">{fileName}</p>
          </div>
          <div className="rounded-2xl bg-slate-100 p-4">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500 font-semibold">Carregado em</p>
            <p className="mt-3 text-base font-semibold text-slate-900">{uploadDate?.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl bg-slate-100 p-4">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500 font-semibold">Registros</p>
            <p className="mt-3 text-base font-semibold text-slate-900">{rowCount}</p>
          </div>
        </div>
      )}

      {processing && (
        <div className="mt-6">
          <div className="mb-4 rounded-full overflow-hidden bg-slate-100 shadow-inner h-3">
            <div
              className="h-full bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 text-center">
            Processando em lotes • {progress}% completo
          </p>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <Button
            onClick={onProcess}
            variant="primary"
            disabled={!fileName || loading || processing || !!validationError}
          >
            {processing ? (
              <>
                <FaSpinner className="animate-spin" /> Processando...
              </>
            ) : (
              <>
                <FaFileExcel /> Processar importação
              </>
            )}
          </Button>
          {processing && (
            <Button onClick={onCancel} variant="ghost">
              Cancelar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

