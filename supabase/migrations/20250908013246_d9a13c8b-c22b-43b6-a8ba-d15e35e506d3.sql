-- Fix security warnings by setting proper search_path on functions

-- Update encrypt_password function with proper search_path
CREATE OR REPLACE FUNCTION public.encrypt_password(password_text TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Use deterministic encryption so we can still query by encrypted values if needed
  -- The key is automatically managed by pgsodium
  RETURN encode(
    pgsodium.crypto_aead_det_encrypt(
      convert_to(password_text, 'utf8'),
      convert_to('password_context', 'utf8'),
      pgsodium.crypto_aead_det_keygen()
    ),
    'base64'
  );
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Password encryption failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update decrypt_password function with proper search_path  
CREATE OR REPLACE FUNCTION public.decrypt_password(encrypted_password TEXT, encryption_key BYTEA)
RETURNS TEXT AS $$
BEGIN
  -- Decrypt the password using the provided key
  RETURN convert_from(
    pgsodium.crypto_aead_det_decrypt(
      decode(encrypted_password, 'base64'),
      convert_to('password_context', 'utf8'),
      encryption_key
    ),
    'utf8'
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Return null if decryption fails (invalid key or corrupted data)
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update get_encryption_key function with proper search_path
CREATE OR REPLACE FUNCTION public.get_encryption_key()
RETURNS BYTEA AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  -- Only allow authenticated users who are admins or super admins
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Authentication required';
  END IF;
  
  IF NOT (SELECT COALESCE(is_admin, false) OR COALESCE(super_admin, false) FROM profiles WHERE id = current_user_id) THEN
    RAISE EXCEPTION 'Unauthorized: Admin privileges required';
  END IF;
  
  -- Return a consistent key based on installation (in production, this should use a proper key management system)
  -- For now, we'll use a deterministic key generation
  RETURN pgsodium.crypto_aead_det_keygen();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update encrypt_existing_company_passwords function with proper search_path
CREATE OR REPLACE FUNCTION public.encrypt_existing_company_passwords()
RETURNS INTEGER AS $$
DECLARE
  rec RECORD;
  encryption_key BYTEA;
  encrypted_pass TEXT;
  updated_count INTEGER := 0;
BEGIN
  -- Get encryption key
  encryption_key := pgsodium.crypto_aead_det_keygen();
  
  -- Encrypt existing passwords
  FOR rec IN SELECT id, password FROM public.company_access WHERE password IS NOT NULL AND password_encrypted IS NULL LOOP
    BEGIN
      encrypted_pass := encode(
        pgsodium.crypto_aead_det_encrypt(
          convert_to(rec.password, 'utf8'),
          convert_to('password_context', 'utf8'),
          encryption_key
        ),
        'base64'
      );
      
      UPDATE public.company_access 
      SET password_encrypted = encrypted_pass,
          encryption_key = encryption_key
      WHERE id = rec.id;
      
      updated_count := updated_count + 1;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Failed to encrypt password for company_access id %: %', rec.id, SQLERRM;
    END;
  END LOOP;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update encrypt_existing_user_passwords function with proper search_path
CREATE OR REPLACE FUNCTION public.encrypt_existing_user_passwords()
RETURNS INTEGER AS $$
DECLARE
  rec RECORD;
  encryption_key BYTEA;
  encrypted_pass TEXT;
  updated_count INTEGER := 0;
BEGIN
  -- Get encryption key
  encryption_key := pgsodium.crypto_aead_det_keygen();
  
  -- Encrypt existing passwords
  FOR rec IN SELECT id, password FROM public.user_access WHERE password IS NOT NULL AND password_encrypted IS NULL LOOP
    BEGIN
      encrypted_pass := encode(
        pgsodium.crypto_aead_det_encrypt(
          convert_to(rec.password, 'utf8'),
          convert_to('password_context', 'utf8'),
          encryption_key
        ),
        'base64'
      );
      
      UPDATE public.user_access 
      SET password_encrypted = encrypted_pass,
          encryption_key = encryption_key
      WHERE id = rec.id;
      
      updated_count := updated_count + 1;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Failed to encrypt password for user_access id %: %', rec.id, SQLERRM;
    END;
  END LOOP;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;