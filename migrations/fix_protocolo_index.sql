-- Correcao: recriar indice unico em protocolo para upsert funcionar
-- Execute este SQL no editor SQL do Supabase

-- 1. Remover indice antigo (pode ser nao-unico)
DROP INDEX IF EXISTS public.idx_agendamentos_protocolo;

-- 2. Recriar indice unico parcial (ignora NULLs)
CREATE UNIQUE INDEX IF NOT EXISTS idx_agendamentos_protocolo
  ON public.agendamentos(protocolo)
  WHERE protocolo IS NOT NULL;

-- 3. Garantir RLS aberto para authenticated
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated upsert agendamentos" ON public.agendamentos;
CREATE POLICY "Allow authenticated upsert agendamentos"
  ON public.agendamentos FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
