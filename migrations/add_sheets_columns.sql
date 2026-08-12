-- Adicionar colunas novas para integração com Google Sheets
ALTER TABLE public.agendamentos ADD COLUMN IF NOT EXISTS protocolo text DEFAULT NULL;
ALTER TABLE public.agendamentos ADD COLUMN IF NOT EXISTS cliente_nome text DEFAULT NULL;
ALTER TABLE public.agendamentos ADD COLUMN IF NOT EXISTS telefone text DEFAULT NULL;
ALTER TABLE public.agendamentos ADD COLUMN IF NOT EXISTS atendente_nome text DEFAULT NULL;
ALTER TABLE public.agendamentos ADD COLUMN IF NOT EXISTS servico_nome text DEFAULT NULL;
ALTER TABLE public.agendamentos ADD COLUMN IF NOT EXISTS fonte text DEFAULT NULL;

-- Garantir que protocolo tenha unique index para o upsert funcionar
CREATE UNIQUE INDEX IF NOT EXISTS idx_agendamentos_protocolo ON public.agendamentos(protocolo) WHERE protocolo IS NOT NULL;
