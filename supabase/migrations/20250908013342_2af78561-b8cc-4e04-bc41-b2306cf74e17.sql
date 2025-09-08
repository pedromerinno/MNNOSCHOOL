-- Create secure functions for managing encrypted passwords in company_access

-- Function to insert company access with encrypted password
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
  encryption_key BYTEA;
  encrypted_pass TEXT;
BEGIN
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
  
  -- Insert record
  INSERT INTO public.company_access (
    company_id,
    tool_name,
    username,
    password, -- Keep for backward compatibility temporarily
    password_encrypted,
    encryption_key,
    url,
    notes,
    created_by
  ) VALUES (
    p_company_id,
    p_tool_name,
    p_username,
    p_password, -- Will be removed later
    encrypted_pass,
    encryption_key,
    p_url,
    p_notes,
    auth.uid()
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to update company access with encrypted password
CREATE OR REPLACE FUNCTION public.update_company_access(
  p_id UUID,
  p_tool_name TEXT DEFAULT NULL,
  p_username TEXT DEFAULT NULL,
  p_password TEXT DEFAULT NULL,
  p_url TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  encryption_key BYTEA;
  encrypted_pass TEXT;
BEGIN
  -- If password is being updated, encrypt it
  IF p_password IS NOT NULL THEN
    -- Get existing key or generate new one
    SELECT company_access.encryption_key INTO encryption_key
    FROM public.company_access 
    WHERE id = p_id;
    
    IF encryption_key IS NULL THEN
      encryption_key := pgsodium.crypto_aead_det_keygen();
    END IF;
    
    -- Encrypt new password
    encrypted_pass := encode(
      pgsodium.crypto_aead_det_encrypt(
        convert_to(p_password, 'utf8'),
        convert_to('password_context', 'utf8'),
        encryption_key
      ),
      'base64'
    );
  END IF;
  
  -- Update record
  UPDATE public.company_access SET
    tool_name = COALESCE(p_tool_name, tool_name),
    username = COALESCE(p_username, username),
    password = COALESCE(p_password, password), -- Temporary
    password_encrypted = COALESCE(encrypted_pass, password_encrypted),
    encryption_key = COALESCE(encryption_key, company_access.encryption_key),
    url = COALESCE(p_url, url),
    notes = COALESCE(p_notes, notes)
  WHERE id = p_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to get decrypted company access (admin only)
CREATE OR REPLACE FUNCTION public.get_company_access_decrypted(p_company_id UUID)
RETURNS TABLE (
  id UUID,
  company_id UUID,
  tool_name TEXT,
  username TEXT,
  password_decrypted TEXT,
  url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ,
  created_by UUID
) AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  -- Check authorization
  IF NOT (
    SELECT COALESCE(is_admin, false) OR COALESCE(super_admin, false) 
    FROM profiles 
    WHERE profiles.id = current_user_id
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin privileges required';
  END IF;
  
  -- Return decrypted data
  RETURN QUERY
  SELECT 
    ca.id,
    ca.company_id,
    ca.tool_name,
    ca.username,
    CASE 
      WHEN ca.password_encrypted IS NOT NULL AND ca.encryption_key IS NOT NULL THEN
        public.decrypt_password(ca.password_encrypted, ca.encryption_key)
      ELSE ca.password -- Fallback to plaintext temporarily
    END as password_decrypted,
    ca.url,
    ca.notes,
    ca.created_at,
    ca.created_by
  FROM public.company_access ca
  WHERE ca.company_id = p_company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Similar functions for user_access table

-- Function to insert user access with encrypted password
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
  
  -- Insert record
  INSERT INTO public.user_access (
    user_id,
    tool_name,
    username,
    password, -- Keep for backward compatibility temporarily
    password_encrypted,
    encryption_key,
    url,
    notes
  ) VALUES (
    auth.uid(),
    p_tool_name,
    p_username,
    p_password, -- Will be removed later
    encrypted_pass,
    encryption_key,
    p_url,
    p_notes
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to get decrypted user access (own data only)
CREATE OR REPLACE FUNCTION public.get_user_access_decrypted()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  tool_name TEXT,
  username TEXT,
  password_decrypted TEXT,
  url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Return decrypted data for current user only
  RETURN QUERY
  SELECT 
    ua.id,
    ua.user_id,
    ua.tool_name,
    ua.username,
    CASE 
      WHEN ua.password_encrypted IS NOT NULL AND ua.encryption_key IS NOT NULL THEN
        public.decrypt_password(ua.password_encrypted, ua.encryption_key)
      ELSE ua.password -- Fallback to plaintext temporarily
    END as password_decrypted,
    ua.url,
    ua.notes,
    ua.created_at,
    ua.updated_at
  FROM public.user_access ua
  WHERE ua.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;