-- =====================================================
-- DEBUG: Verificar permissões do usuário atual
-- =====================================================
-- Execute este script para verificar se o usuário tem
-- as permissões necessárias para criar documentos
-- =====================================================

-- 1. Verificar usuário atual
SELECT 
  'USUÁRIO ATUAL:' as info,
  auth.uid() as user_id,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as user_email;

-- 2. Verificar se é super admin
SELECT 
  'É SUPER ADMIN?' as info,
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND super_admin = true
  ) as is_super_admin;

-- 3. Verificar empresas do usuário
SELECT 
  'EMPRESAS DO USUÁRIO:' as info,
  ue.empresa_id,
  e.nome as empresa_nome,
  ue.is_admin as is_admin_da_empresa
FROM public.user_empresa ue
JOIN public.empresas e ON e.id = ue.empresa_id
WHERE ue.user_id = auth.uid();

-- 4. Verificar se é admin de alguma empresa
SELECT 
  'É ADMIN DE ALGUMA EMPRESA?' as info,
  EXISTS (
    SELECT 1 FROM public.user_empresa 
    WHERE user_id = auth.uid() 
    AND is_admin = true
  ) as is_company_admin;

-- 5. Testar a função user_is_company_admin com uma empresa específica
-- (Substitua 'SEU_COMPANY_ID_AQUI' pelo ID da empresa que você está tentando usar)
SELECT 
  'TESTE user_is_company_admin:' as info,
  public.user_is_company_admin('SEU_COMPANY_ID_AQUI'::uuid) as result;

-- 6. Verificar políticas RLS atuais
SELECT 
  'POLÍTICAS RLS ATUAIS:' as info,
  policyname,
  cmd,
  with_check
FROM pg_policies
WHERE tablename = 'company_documents'
ORDER BY cmd, policyname;


