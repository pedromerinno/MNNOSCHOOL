-- Fix create_user_access function to always insert password field
-- This ensures the NOT NULL constraint on password column is satisfied

CREATE OR REPLACE FUNCTION public.create_user_access(
  p_tool_name TEXT,
  p_username TEXT,
  p_password TEXT,
  p_url TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_id UUID;
  encryption_key BYTEA;
  encrypted_pass TEXT;
BEGIN
  -- Validate required parameters
  IF p_tool_name IS NULL OR p_tool_name = '' THEN
    RAISE EXCEPTION 'tool_name cannot be null or empty';
  END IF;
  
  IF p_username IS NULL OR p_username = '' THEN
    RAISE EXCEPTION 'username cannot be null or empty';
  END IF;
  
  IF p_password IS NULL OR p_password = '' THEN
    RAISE EXCEPTION 'password cannot be null or empty';
  END IF;

  -- Generate encryption key
  encryption_key := pgsodium.crypto_aead_det_keygen();
  
  -- Encrypt password
  encrypted_pass := encode(
    pgsodium.crypto_aead_det_encrypt(
      convert_to(p_password, 'utf8'),
      convert_to('password_context', 'utf8'),
      encryption_key
    ),
    'base64'
  );
  
  -- Insert record with both password (for NOT NULL constraint) and encrypted version
  INSERT INTO public.user_access (
    user_id,
    tool_name,
    username,
    password,
    password_encrypted,
    encryption_key,
    url,
    notes
  ) VALUES (
    auth.uid(),
    p_tool_name,
    p_username,
    p_password, -- Required for NOT NULL constraint
    encrypted_pass,
    encryption_key,
    p_url,
    p_notes
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;



