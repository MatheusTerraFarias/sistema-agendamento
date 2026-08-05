-- =============================================
-- LIMPAR CLIENTES DUPLICADOS
-- =============================================
-- Passo 1: Migrar agendamentos dos duplicados para o cliente que será mantido
-- =============================================

UPDATE public.agendamentos a
SET cliente_id = kept.id
FROM (
  SELECT DISTINCT ON (LOWER(TRIM(c.nome))) c.nome AS keep_nome, c.id
  FROM public.clientes c
  ORDER BY LOWER(TRIM(c.nome)), c.id
) kept
JOIN public.clientes dup ON LOWER(TRIM(dup.nome)) = LOWER(TRIM(kept.keep_nome)) AND dup.id <> kept.id
WHERE a.cliente_id = dup.id;

-- =============================================
-- Passo 2: Deletar clientes duplicados
-- (mantém apenas o de menor ID para cada nome)
-- =============================================

DELETE FROM public.clientes c
USING (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY LOWER(TRIM(nome)) ORDER BY id) AS rn
    FROM public.clientes
  ) ranked
  WHERE rn > 1
) dupes
WHERE c.id = dupes.id;

-- =============================================
-- Verificação: quantos clientes restaram?
-- =============================================
SELECT COUNT(*) AS total_clientes FROM public.clientes;
