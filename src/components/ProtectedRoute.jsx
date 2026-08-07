import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ProtectedRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function verifySession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(session);
      setChecking(false);
    }

    verifySession();

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      if (!mounted) return;
      setSession(session || null);
      setChecking(false);
    });

    return () => { mounted = false; listener?.subscription?.unsubscribe(); };
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
