-- Garantir que agendamentos tenha RLS habilitado e permita upsert
-- Execute este SQL no editor SQL do Supabase

-- 1. Remover indice antigo (pode ser nao-unico) e recriar como unico
DROP INDEX IF EXISTS public.idx_agendamentos_protocolo;
CREATE UNIQUE INDEX IF NOT EXISTS idx_agendamentos_protocolo
  ON public.agendamentos(protocolo)
  WHERE protocolo IS NOT NULL;

-- 2. Habilitar RLS
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

-- 3. Permitir que usuario autenticado faca INSERT/UPDATE/SELECT
DROP POLICY IF EXISTS "Allow authenticated agendamentos" ON public.agendamentos;
CREATE POLICY "Allow authenticated agendamentos"
  ON public.agendamentos FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
