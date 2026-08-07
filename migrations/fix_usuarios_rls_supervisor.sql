-- Permitir que supervisores também criem e editem perfis de usuários.
-- A política original só permitia auth.uid() = id ou admin.

DROP POLICY IF EXISTS "Insert own or admin usuarios" ON public.usuarios;
CREATE POLICY "Insert own or admin usuarios"
  ON public.usuarios FOR INSERT
  WITH CHECK (
    auth.uid() = id
    OR public.is_admin_user()
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND perfil IN ('admin', 'supervisor', 'supervisora')
    )
  );

DROP POLICY IF EXISTS "Update own or admin usuarios" ON public.usuarios;
CREATE POLICY "Update own or admin usuarios"
  ON public.usuarios FOR UPDATE
  USING (
    auth.uid() = id
    OR public.is_admin_user()
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND perfil IN ('admin', 'supervisor', 'supervisora')
    )
  )
  WITH CHECK (
    auth.uid() = id
    OR public.is_admin_user()
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND perfil IN ('admin', 'supervisor', 'supervisora')
    )
  );

DROP POLICY IF EXISTS "Delete own or admin usuarios" ON public.usuarios;
CREATE POLICY "Delete own or admin usuarios"
  ON public.usuarios FOR DELETE
  USING (
    auth.uid() = id
    OR public.is_admin_user()
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND perfil IN ('admin', 'supervisor', 'supervisora')
    )
  );
