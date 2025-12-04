-- =====================================================
-- FIX: Corrigir política RLS para INSERT em company_documents
-- =====================================================
-- PROBLEMA: A política original usava JOIN ou referências incorretas
--           que não funcionam em cláusulas WITH CHECK do PostgreSQL
-- SOLUÇÃO: Usar referência direta à tabela company_documents.company_id
-- =====================================================

-- Remover TODAS as políticas de INSERT existentes
-- Isso garante que não haja conflitos
DROP POLICY IF EXISTS "company_documents_insert" ON public.company_documents;
DROP POLICY IF EXISTS "Admins can create company documents" ON public.company_documents;

-- Remover qualquer outra política de INSERT que possa existir com nome diferente
DO $$ 
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'company_documents' 
    AND cmd = 'INSERT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.company_documents', policy_record.policyname);
  END LOOP;
END $$;

-- Criar a política correta
-- IMPORTANTE: Em WITH CHECK, referenciamos company_documents.company_id diretamente
--             (não podemos usar NEW.company_id como em triggers)
CREATE POLICY "company_documents_insert"
ON public.company_documents
FOR INSERT
WITH CHECK (
  -- Super admin pode inserir documentos para qualquer empresa
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND super_admin = true
  ) OR 
  -- Admin da empresa pode inserir documentos para sua própria empresa
  -- NOTA: company_documents.company_id referencia a coluna da tabela na cláusula WITH CHECK
  EXISTS (
    SELECT 1 FROM public.user_empresa 
    WHERE user_id = auth.uid() 
    AND empresa_id = company_documents.company_id 
    AND is_admin = true
  )
);

-- Verificar se a política foi criada corretamente
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'company_documents' 
    AND cmd = 'INSERT' 
    AND policyname = 'company_documents_insert'
  ) THEN
    RAISE EXCEPTION 'Falha ao criar política company_documents_insert';
  END IF;
END $$;

