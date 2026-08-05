-- =============================================
-- SISTEMA DE DISTRIBUIÇÃO DE ATIVIDADES
-- =============================================

-- 1) Coluna na tabela agendamentos para rastrear quem recebeu a distribuição
ALTER TABLE public.agendamentos
  ADD COLUMN IF NOT EXISTS distribuido_para uuid REFERENCES auth.users(id) DEFAULT NULL;

-- 2) Tabela de regras de distribuição (salvas pelo admin)
CREATE TABLE IF NOT EXISTS public.regras_distribuicao (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  areas text[] DEFAULT '{}',           -- ex: '{SP2,ITAIM}' ou vazio = todas
  tipos_atividade text[] DEFAULT '{}', -- ex: '{Ativação,Reparo}' ou vazio = todos
  atendentes uuid[] DEFAULT '{}',      -- ids dos atendentes selecionados
  modo text NOT NULL DEFAULT 'igualitario', -- 'quantidade', 'percentual', 'igualitario'
  regras jsonb DEFAULT '[]',           -- [{atendente_id, quantidade}] ou [{atendente_id, percentual}]
  criado_por uuid REFERENCES auth.users(id),
  criado_em timestamptz DEFAULT now(),
  ativo boolean DEFAULT true
);

-- 3) Tabela de histórico de distribuições
CREATE TABLE IF NOT EXISTS public.historico_distribuicao (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  regra_id uuid REFERENCES public.regras_distribuicao(id),
  total_atividades int DEFAULT 0,
  por_area jsonb DEFAULT '{}',         -- {"SP2": 10, "ITAIM": 5}
  por_tipo jsonb DEFAULT '{}',         -- {"Ativação": 8, "Reparo": 7}
  distribuicao jsonb DEFAULT '{}',     -- [{atendente_id, nome, quantidade, percentual}]
  criado_por uuid REFERENCES auth.users(id),
  criado_em timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.regras_distribuicao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_distribuicao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin pode tudo em regras_distribuicao"
  ON public.regras_distribuicao FOR ALL
  USING (public.is_admin_user());

CREATE POLICY "Admin pode tudo em historico_distribuicao"
  ON public.historico_distribuicao FOR ALL
  USING (public.is_admin_user());
