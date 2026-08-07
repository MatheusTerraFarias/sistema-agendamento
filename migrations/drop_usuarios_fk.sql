-- Remover a constraint de foreign key que impede criar usuários
-- sem Auth user correspondente. O vínculo pode ser feito depois.

ALTER TABLE public.usuarios
  DROP CONSTRAINT IF EXISTS usuarios_id_fkey;
