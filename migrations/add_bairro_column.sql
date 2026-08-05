-- Adicionar coluna bairro na tabela agendamentos
-- Execute este SQL no editor SQL do Supabase antes de importar novamente

ALTER TABLE public.agendamentos
  ADD COLUMN IF NOT EXISTS bairro text DEFAULT NULL;

-- Migrar dados existentes: copiar area para bairro onde bairro está vazio
UPDATE public.agendamentos
  SET bairro = area
  WHERE bairro IS NULL AND area IS NOT NULL;
