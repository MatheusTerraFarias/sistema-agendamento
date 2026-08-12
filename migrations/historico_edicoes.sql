-- =============================================
-- HISTORICO DE EDICOES / MOVIMENTACOES DO CHAMADO
-- =============================================

CREATE TABLE IF NOT EXISTS public.historico_edicoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agendamento_id bigint NOT NULL REFERENCES public.agendamentos(id) ON DELETE CASCADE,
  usuario_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usuario_nome text NOT NULL DEFAULT '',
  acao text NOT NULL DEFAULT 'edicao',
  descricao text NOT NULL DEFAULT '',
  campos_alterados jsonb NOT NULL DEFAULT '[]'::jsonb,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_historico_edicoes_agendamento_id
  ON public.historico_edicoes(agendamento_id);
CREATE INDEX IF NOT EXISTS idx_historico_edicoes_agendamento_criado
  ON public.historico_edicoes(agendamento_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_historico_edicoes_usuario_id
  ON public.historico_edicoes(usuario_id);

ALTER TABLE public.historico_edicoes ENABLE ROW LEVEL SECURITY;

-- Helper: usuario pode acessar o chamado (mesma regra das notas)
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

GRANT EXECUTE ON FUNCTION public.pode_ver_chamado(bigint) TO authenticated;

-- SELECT: historico de chamados que o usuario pode ver
DROP POLICY IF EXISTS "Atendente ve historico do chamado" ON public.historico_edicoes;
CREATE POLICY "Atendente ve historico do chamado"
  ON public.historico_edicoes FOR SELECT
  USING (public.pode_ver_chamado(agendamento_id));

-- INSERT: usuario autenticado, dono do registro e com acesso ao chamado
DROP POLICY IF EXISTS "Usuario registra historico" ON public.historico_edicoes;
CREATE POLICY "Usuario registra historico"
  ON public.historico_edicoes FOR INSERT
  WITH CHECK (
    usuario_id = auth.uid()
    AND public.pode_ver_chamado(agendamento_id)
  );
