-- ==========================================================
-- SUPORTE À AUTOMAÇÃO DE STATUS (OPCIONAL)
-- Execute no Supabase (SQL Editor ou migration runner).
-- ==========================================================

-- Índice para consultas rápidas por protocolo/OS na sincronização.
CREATE INDEX IF NOT EXISTS idx_agendamentos_protocolo ON public.agendamentos(protocolo);

-- Verificação: o índice foi criado?
-- SELECT indexname FROM pg_indexes WHERE tablename = 'agendamentos';

-- Observação: a automação usa a chave service_role do Supabase, que ignora
-- RLS. Mantenha essa chave apenas em ambiente servidor (nunca no front-end).
