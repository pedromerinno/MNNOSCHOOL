-- Fix create_company_access function to validate password and ensure it's never null
-- This ensures the NOT NULL constraint on password column is satisfied

CREATE OR REPLACE FUNCTION public.create_company_access(
  p_company_id UUID,
  p_tool_name TEXT,
  p_username TEXT,
  p_password TEXT,
  p_url TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  -- Validate required parameters
  IF p_company_id IS NULL THEN
    RAISE EXCEPTION 'company_id cannot be null';
  END IF;
  
  IF p_tool_name IS NULL OR p_tool_name = '' THEN
    RAISE EXCEPTION 'tool_name cannot be null or empty';
  END IF;
  
  IF p_username IS NULL OR p_username = '' THEN
    RAISE EXCEPTION 'username cannot be null or empty';
  END IF;
  
  IF p_password IS NULL OR p_password = '' THEN
    RAISE EXCEPTION 'password cannot be null or empty';
  END IF;

  -- Insert record with plain text password (no encryption)
  INSERT INTO public.company_access (
    company_id,
    tool_name,
    username,
    password,
    url,
    notes,
    created_by
  ) VALUES (
    p_company_id,
    p_tool_name,
    p_username,
    p_password, -- Required for NOT NULL constraint
    p_url,
    p_notes,
    auth.uid()
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION public.create_company_access IS 'Cria um novo acesso da empresa com senha em texto plano (sem criptografia). Valida que todos os campos obrigatórios não sejam null ou vazios.';

