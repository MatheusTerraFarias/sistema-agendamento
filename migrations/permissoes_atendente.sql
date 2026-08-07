-- =============================================
-- PERMISSÕES E CONTROLE DE ACESSO - ATENDENTE
-- =============================================

-- 1) RLS para agendamentos: atendente só vê seus próprios
-- Primeiro, remover política existente se houver
DROP POLICY IF EXISTS "Atendente vê seus agendamentos" ON public.agendamentos;
DROP POLICY IF EXISTS "Supervisor vê todos agendamentos" ON public.agendamentos;

-- Atendente só vê agendamentos onde foi criador OU designado
CREATE POLICY "Atendente vê seus agendamentos"
  ON public.agendamentos FOR SELECT
  USING (
    auth.uid() = criado_por
    OR auth.uid() = distribuido_para
  );

-- Supervisor/Admin vê todos
CREATE POLICY "Supervisor vê todos agendamentos"
  ON public.agendamentos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND perfil IN ('admin', 'supervisor', 'supervisora')
    )
  );

-- 2) RLS para regras_distribuicao: só admin/supervisor
DROP POLICY IF EXISTS "Admin pode tudo em regras_distribuicao" ON public.regras_distribuicao;
CREATE POLICY "Admin pode tudo em regras_distribuicao"
  ON public.regras_distribuicao FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND perfil IN ('admin', 'supervisor', 'supervisora')
    )
  );

-- 3) RLS para historico_distribuicao: só admin/supervisor
DROP POLICY IF EXISTS "Admin pode tudo em historico_distribuicao" ON public.historico_distribuicao;
CREATE POLICY "Admin pode tudo em historico_distribuicao"
  ON public.historico_distribuicao FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND perfil IN ('admin', 'supervisor', 'supervisora')
    )
  );

-- 4) RLS para usuarios: atendente só vê seu próprio perfil
DROP POLICY IF EXISTS "Atendente vê seu perfil" ON public.usuarios;
DROP POLICY IF EXISTS "Supervisor vê todos usuarios" ON public.usuarios;

CREATE POLICY "Atendente vê seu perfil"
  ON public.usuarios FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Supervisor vê todos usuarios"
  ON public.usuarios FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios u2
      WHERE u2.id = auth.uid()
      AND u2.perfil IN ('admin', 'supervisor', 'supervisora')
    )
  );
