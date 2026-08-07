-- Adicionar coluna protocolo na tabela agendamentos
-- Usada pelo automacao-status para sincronizar status entre planilha e sistema.

ALTER TABLE public.agendamentos
  ADD COLUMN IF NOT EXISTS protocolo text DEFAULT NULL;

-- Índice para consultas rápidas na sincronização
CREATE INDEX IF NOT EXISTS idx_agendamentos_protocolo ON public.agendamentos(protocolo);

-- Verificação
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'agendamentos' AND column_name = 'protocolo';
