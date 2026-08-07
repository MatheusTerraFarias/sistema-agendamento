import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const err = this.state.error;
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
            <div className="h-14 w-14 rounded-2xl bg-danger-50 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              Algo deu errado
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              Ocorreu um erro inesperado. Tente recarregar a página.
            </p>
            <pre className="text-xs text-left bg-slate-50 rounded-xl p-3 overflow-auto max-h-40 text-danger-600 border border-slate-100 mb-4">
              {err?.message || String(err)}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-all duration-200 active:scale-[0.98]"
            >
              Recarregar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
