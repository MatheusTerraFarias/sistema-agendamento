-- Supabase RLS policy for the `usuarios` table.
-- Apply this in Supabase SQL editor or migration runner.

-- Enable row-level security if not already enabled.
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Helper function to determine whether the current auth user is an admin.
-- This function runs as a SECURITY DEFINER, so it can read the same table without causing recursive policy evaluation.
CREATE OR REPLACE FUNCTION public.is_admin_user() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid() AND perfil = 'admin'
  );
$$;

DROP POLICY IF EXISTS "Select own or admin usuarios" ON public.usuarios;
CREATE POLICY "Select own or admin usuarios"
  ON public.usuarios FOR SELECT
  USING (
    auth.uid() = id
    OR public.is_admin_user()
  );

DROP POLICY IF EXISTS "Insert own or admin usuarios" ON public.usuarios;
CREATE POLICY "Insert own or admin usuarios"
  ON public.usuarios FOR INSERT
  WITH CHECK (
    auth.uid() = id
    OR public.is_admin_user()
  );

DROP POLICY IF EXISTS "Update own or admin usuarios" ON public.usuarios;
CREATE POLICY "Update own or admin usuarios"
  ON public.usuarios FOR UPDATE
  USING (
    auth.uid() = id
    OR public.is_admin_user()
  )
  WITH CHECK (
    auth.uid() = id
    OR public.is_admin_user()
  );

DROP POLICY IF EXISTS "Delete own or admin usuarios" ON public.usuarios;
CREATE POLICY "Delete own or admin usuarios"
  ON public.usuarios FOR DELETE
  USING (
    auth.uid() = id
    OR public.is_admin_user()
  );
