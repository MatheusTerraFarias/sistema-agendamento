-- =============================================
-- NOTAS / HISTORICO DE ATENDIMENTO POR CHAMADO
-- =============================================

CREATE TABLE IF NOT EXISTS public.notas_chamados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chamado_id bigint NOT NULL REFERENCES public.agendamentos(id) ON DELETE CASCADE,
  usuario_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usuario_nome text NOT NULL DEFAULT '',
  conteudo text NOT NULL,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

-- Indices para carregar o historico rapidamente
CREATE INDEX IF NOT EXISTS idx_notas_chamados_chamado_id
  ON public.notas_chamados(chamado_id);
CREATE INDEX IF NOT EXISTS idx_notas_chamados_chamado_criado
  ON public.notas_chamados(chamado_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_notas_chamados_usuario_id
  ON public.notas_chamados(usuario_id);

-- RLS
ALTER TABLE public.notas_chamados ENABLE ROW LEVEL SECURITY;

-- Helper: usuario pode acessar o chamado (mesma regra da tabela agendamentos)
CREATE OR REPLACE FUNCTION public.pode_ver_chamado(p_chamado_id bigint)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.agendamentos a
    WHERE a.id = p_chamado_id
    AND (
      a.criado_por = auth.uid()
      OR a.distribuido_para = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.usuarios u
        WHERE u.id = auth.uid()
        AND u.perfil IN ('admin', 'supervisor', 'supervisora')
      )
    )
  );
$$;

-- Helper: usuario atual e supervisor/admin
CREATE OR REPLACE FUNCTION public.pode_gerenciar_notas()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios u
    WHERE u.id = auth.uid()
    AND u.perfil IN ('admin', 'supervisor', 'supervisora')
  );
$$;

GRANT EXECUTE ON FUNCTION public.pode_ver_chamado(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.pode_gerenciar_notas() TO authenticated;

-- SELECT: apenas notas de chamados que o usuario pode ver
DROP POLICY IF EXISTS "Atendente ve notas do chamado" ON public.notas_chamados;
CREATE POLICY "Atendente ve notas do chamado"
  ON public.notas_chamados FOR SELECT
  USING (public.pode_ver_chamado(chamado_id));

-- INSERT: usuario autenticado, dono da nota e com acesso ao chamado
DROP POLICY IF EXISTS "Atendente cria nota" ON public.notas_chamados;
CREATE POLICY "Atendente cria nota"
  ON public.notas_chamados FOR INSERT
  WITH CHECK (
    usuario_id = auth.uid()
    AND public.pode_ver_chamado(chamado_id)
  );

-- UPDATE: dono da nota ou supervisor, sempre com acesso ao chamado
DROP POLICY IF EXISTS "Dono ou supervisor edita nota" ON public.notas_chamados;
CREATE POLICY "Dono ou supervisor edita nota"
  ON public.notas_chamados FOR UPDATE
  USING (
    public.pode_ver_chamado(chamado_id)
    AND (usuario_id = auth.uid() OR public.pode_gerenciar_notas())
  )
  WITH CHECK (
    public.pode_ver_chamado(chamado_id)
    AND (usuario_id = auth.uid() OR public.pode_gerenciar_notas())
  );

-- DELETE: dono da nota ou supervisor, sempre com acesso ao chamado
DROP POLICY IF EXISTS "Dono ou supervisor exclui nota" ON public.notas_chamados;
CREATE POLICY "Dono ou supervisor exclui nota"
  ON public.notas_chamados FOR DELETE
  USING (
    public.pode_ver_chamado(chamado_id)
    AND (usuario_id = auth.uid() OR public.pode_gerenciar_notas())
  );
