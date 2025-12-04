-- Script de diagnóstico para verificar visibilidade de documentos da empresa
-- Execute este script no Supabase SQL Editor para diagnosticar problemas de visibilidade

-- 1. Verificar políticas RLS ativas para company_document_job_roles
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as operation,
  qual as using_clause,
  with_check as with_check_clause
FROM pg_policies
WHERE tablename = 'company_document_job_roles'
ORDER BY policyname;

-- 2. Verificar políticas RLS ativas para company_document_users
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as operation,
  qual as using_clause,
  with_check as with_check_clause
FROM pg_policies
WHERE tablename = 'company_document_users'
ORDER BY policyname;

-- 3. Verificar vínculos de um documento específico (substitua 'DOCUMENT_ID' pelo ID do documento)
-- SELECT 
--   cd.id as document_id,
--   cd.name as document_name,
--   cd.company_id,
--   COUNT(DISTINCT cdjr.job_role_id) as role_restrictions_count,
--   COUNT(DISTINCT cdu.user_id) as user_restrictions_count,
--   CASE 
--     WHEN COUNT(DISTINCT cdjr.job_role_id) = 0 AND COUNT(DISTINCT cdu.user_id) = 0 
--     THEN 'Público' 
--     ELSE 'Restrito' 
--   END as visibility_status
-- FROM company_documents cd
-- LEFT JOIN company_document_job_roles cdjr ON cd.id = cdjr.company_document_id
-- LEFT JOIN company_document_users cdu ON cd.id = cdu.company_document_id
-- WHERE cd.id = 'DOCUMENT_ID' -- Substitua pelo ID do documento
-- GROUP BY cd.id, cd.name, cd.company_id;

-- 4. Listar todos os documentos com suas restrições de visibilidade
SELECT 
  cd.id,
  cd.name,
  cd.company_id,
  e.nome as company_name,
  COUNT(DISTINCT cdjr.job_role_id) as role_restrictions,
  COUNT(DISTINCT cdu.user_id) as user_restrictions,
  CASE 
    WHEN COUNT(DISTINCT cdjr.job_role_id) = 0 AND COUNT(DISTINCT cdu.user_id) = 0 
    THEN 'Público' 
    ELSE 'Restrito' 
  END as visibility_status,
  cd.created_at,
  cd.updated_at
FROM company_documents cd
LEFT JOIN empresas e ON cd.company_id = e.id
LEFT JOIN company_document_job_roles cdjr ON cd.id = cdjr.company_document_id
LEFT JOIN company_document_users cdu ON cd.id = cdu.company_document_id
GROUP BY cd.id, cd.name, cd.company_id, e.nome, cd.created_at, cd.updated_at
ORDER BY cd.updated_at DESC
LIMIT 20;

-- 5. Verificar se há vínculos órfãos (vínculos sem documento correspondente)
SELECT 'company_document_job_roles' as table_name, COUNT(*) as orphan_count
FROM company_document_job_roles cdjr
LEFT JOIN company_documents cd ON cdjr.company_document_id = cd.id
WHERE cd.id IS NULL
UNION ALL
SELECT 'company_document_users' as table_name, COUNT(*) as orphan_count
FROM company_document_users cdu
LEFT JOIN company_documents cd ON cdu.company_document_id = cd.id
WHERE cd.id IS NULL;

-- 6. Verificar permissões do usuário atual
SELECT 
  p.id as user_id,
  p.display_name,
  p.super_admin,
  ue.empresa_id,
  ue.is_admin as is_company_admin,
  e.nome as company_name
FROM profiles p
LEFT JOIN user_empresa ue ON p.id = ue.user_id
LEFT JOIN empresas e ON ue.empresa_id = e.id
WHERE p.id = auth.uid();

