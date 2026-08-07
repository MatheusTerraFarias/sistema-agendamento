import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ProtectedRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [session, setSession] = useState(null);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function verifySession() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!mounted) return;
        if (error) {
          console.error("Session check error:", error);
          setAuthError(error.message);
        }
        setSession(session || null);
      } catch (err) {
        console.error("Session check failed:", err);
        if (!mounted) return;
        setAuthError(err.message || "Erro ao verificar sessão");
        setSession(null);
      } finally {
        if (mounted) setChecking(false);
      }
    }

    verifySession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        setSession(session || null);
        setChecking(false);
      }
    );

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  if (checking) {
    return (
      <div className="page-anim min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-200 animate-pulse" />
          <p className="text-sm text-slate-400 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!session) return <Navigate to="/" replace />;

  return children;
}
