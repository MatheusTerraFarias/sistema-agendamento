import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import PageContainer from "./layout/PageContainer";

export default function ProtectedRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);

  async function loadUserProfile(userId) {
    const { data, error } = await supabase
      .from("usuarios")
      .select("perfil, nome")
      .eq("id", userId)
      .limit(1);

    if (error) {
      console.error("Erro ao carregar perfil do usuário:", error.message);
      setProfile(null);
      return;
    }

    setProfile(Array.isArray(data) ? data[0] || null : data || null);
  }

  useEffect(() => {
    let mounted = true;

    async function verifySession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;
      setSession(session);
      if (session) {
        await loadUserProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setChecking(false);
    }

    verifySession();

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      if (!mounted) return;
      setSession(session || null);
      if (session) {
        loadUserProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setChecking(false);
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  if (checking) {
    return (
      <div className="page-anim min-h-screen flex items-center justify-center bg-slate-100 text-slate-700">
        Carregando sessão...
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  return (
    <PageContainer session={session} profile={profile}>
      {children}
    </PageContainer>
  );
}
