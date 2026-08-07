import { FaCloudUploadAlt, FaFileExcel, FaSpinner, FaTimes } from "react-icons/fa";

export default function ImportUpload({ fileName, uploadDate, rowCount, validationError, loading, processing, progress, onFileChange, onProcess, onCancel }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-card p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Importar base XLSX</h2>
          <p className="mt-1 text-sm text-slate-400 max-w-xl">
            Faça upload de uma planilha com protocolo, cliente, telefone, status e data de agendamento.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-600 shrink-0">
          <FaFileExcel size={14} className="text-success-600" /> XLSX / XLS
        </div>
      </div>

      <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center transition-all duration-200 hover:border-primary hover:bg-primary-50/30 relative">
        {!processing ? (
          <>
            <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-primary-100 transition">
              <FaCloudUploadAlt className="h-7 w-7 text-slate-400" />
            </div>
            <span className="text-base font-semibold text-slate-800">Arraste o arquivo ou clique para selecionar</span>
            <span className="mt-1.5 text-xs text-slate-400">Apenas arquivos .xlsx ou .xls são aceitos</span>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-primary-50 flex items-center justify-center">
              <FaSpinner className="h-7 w-7 text-primary animate-spin" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-800">Processando {rowCount} registros...</p>
              <p className="text-sm text-slate-400 mt-1">{progress}% concluído</p>
            </div>
          </div>
        )}
        <input type="file" accept=".xlsx,.xls" onChange={onFileChange} disabled={loading || processing} className="sr-only" />
      </label>

      {validationError && (
        <div className="mt-5 rounded-xl bg-danger-50 border border-danger-200 p-4 text-sm text-danger-700 flex items-start gap-3">
          <FaTimes className="shrink-0 mt-0.5" />
          <div>{validationError}</div>
        </div>
      )}

      {fileName && !processing && (
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Arquivo", value: fileName, truncate: true },
            { label: "Carregado em", value: uploadDate?.toLocaleString() || "—" },
            { label: "Registros", value: rowCount },
          ].map((item) => (
            <div key={item.label} className="rounded-xl bg-slate-50 border border-slate-100 p-3.5">
              <p className="text-2xs font-semibold uppercase tracking-wider text-slate-400">{item.label}</p>
              <p className={`mt-1.5 text-sm font-bold text-slate-800 ${item.truncate ? "truncate" : ""}`}>{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {processing && (
        <div className="mt-5">
          <div className="rounded-full overflow-hidden bg-slate-100 h-2.5">
            <div className="h-full bg-gradient-to-r from-primary-400 via-primary-500 to-success-500 transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-400 text-center">Processando em lotes &bull; {progress}% completo</p>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <button
            onClick={onProcess}
            disabled={!fileName || loading || processing || !!validationError}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {processing ? <><FaSpinner className="animate-spin" /> Processando...</> : <><FaFileExcel /> Processar importação</>}
          </button>
          {processing && (
            <button onClick={onCancel} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all duration-200">
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
