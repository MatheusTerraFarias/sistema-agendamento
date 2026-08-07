-- Função que cria o Auth user + perfil na tabela usuarios.
-- Chamada via supabase.rpc('create_user_profile', {...})

CREATE OR REPLACE FUNCTION public.create_user_profile(
  p_nome text,
  p_email text,
  p_perfil text DEFAULT 'atendente',
  p_auth_id uuid DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_result json;
BEGIN
  -- Se não foi informado auth_id, cria um novo Auth user
  IF p_auth_id IS NULL THEN
    -- Gera um UUID para o novo usuário
    v_user_id := gen_random_uuid();

    -- Insere no auth.users (necessita service_role ou SECURITY DEFINER)
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at, confirmation_token,
      recovery_token, email_change_token_new, email_change
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      p_email,
      crypt(gen_random_uuid()::text, gen_salt('bf')),
      now(), now(), now(),
      encode(gen_random_bytes(32), 'hex'),
      encode(gen_random_bytes(32), 'hex'),
      '',
      ''
    );
  ELSE
    v_user_id := p_auth_id;
  END IF;

  -- Insere o perfil na tabela usuarios
  INSERT INTO public.usuarios (id, nome, email, perfil)
  VALUES (v_user_id, p_nome, p_email, p_perfil)
  ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    perfil = EXCLUDED.perfil;

  -- Retorna o resultado
  SELECT json_build_object(
    'id', v_user_id,
    'nome', p_nome,
    'email', p_email,
    'perfil', p_perfil
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- Permitir que qualquer usuário autenticado chame a função
GRANT EXECUTE ON FUNCTION public.create_user_profile(text, text, text, uuid) TO authenticated;
