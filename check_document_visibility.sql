-- Script para verificar a visibilidade de um documento específico
-- Substitua 'NOME_DO_DOCUMENTO' pelo nome do documento (ex: '2BTRUST Tela de Cadastro')

-- 1. Encontrar o documento
SELECT 
  cd.id,
  cd.name,
  cd.company_id,
  e.nome as company_name
FROM company_documents cd
JOIN empresas e ON cd.company_id = e.id
WHERE cd.name ILIKE '%2BTRUST Tela de Cadastro%'
LIMIT 1;

-- 2. Verificar vínculos de cargos (substitua DOCUMENT_ID pelo ID encontrado acima)
-- SELECT 
--   cdjr.id,
--   cdjr.company_document_id,
--   cdjr.job_role_id,
--   jr.title as job_role_title
-- FROM company_document_job_roles cdjr
-- JOIN job_roles jr ON cdjr.job_role_id = jr.id
-- WHERE cdjr.company_document_id = 'DOCUMENT_ID';

-- 3. Verificar vínculos de usuários (substitua DOCUMENT_ID pelo ID encontrado acima)
-- SELECT 
--   cdu.id,
--   cdu.company_document_id,
--   cdu.user_id,
--   p.display_name,
--   p.email
-- FROM company_document_users cdu
-- JOIN profiles p ON cdu.user_id = p.id
-- WHERE cdu.company_document_id = 'DOCUMENT_ID';

-- 4. Verificação completa de um documento (substitua DOCUMENT_ID)
SELECT 
  cd.id,
  cd.name,
  cd.company_id,
  e.nome as company_name,
  COUNT(DISTINCT cdjr.job_role_id) as role_restrictions_count,
  COUNT(DISTINCT cdu.user_id) as user_restrictions_count,
  CASE 
    WHEN COUNT(DISTINCT cdjr.job_role_id) = 0 AND COUNT(DISTINCT cdu.user_id) = 0 
    THEN 'Público' 
    ELSE 'Restrito' 
  END as visibility_status,
  STRING_AGG(DISTINCT jr.title, ', ') as restricted_roles,
  STRING_AGG(DISTINCT p.display_name, ', ') as restricted_users
FROM company_documents cd
JOIN empresas e ON cd.company_id = e.id
LEFT JOIN company_document_job_roles cdjr ON cd.id = cdjr.company_document_id
LEFT JOIN company_document_users cdu ON cd.id = cdu.company_document_id
LEFT JOIN job_roles jr ON cdjr.job_role_id = jr.id
LEFT JOIN profiles p ON cdu.user_id = p.id
WHERE cd.name ILIKE '%2BTRUST Tela de Cadastro%'
GROUP BY cd.id, cd.name, cd.company_id, e.nome;

-- 5. Verificar se o usuário "esdras" tem acesso (substitua DOCUMENT_ID e USER_ID)
-- SELECT 
--   cd.id as document_id,
--   cd.name as document_name,
--   p.id as user_id,
--   p.display_name,
--   p.email,
--   CASE 
--     WHEN EXISTS (
--       SELECT 1 FROM company_document_users cdu 
--       WHERE cdu.company_document_id = cd.id AND cdu.user_id = p.id
--     ) THEN 'Tem acesso (usuário específico)'
--     WHEN EXISTS (
--       SELECT 1 FROM company_document_job_roles cdjr
--       JOIN profiles p2 ON p2.cargo_id = cdjr.job_role_id
--       WHERE cdjr.company_document_id = cd.id AND p2.id = p.id
--     ) THEN 'Tem acesso (por cargo)'
--     WHEN NOT EXISTS (
--       SELECT 1 FROM company_document_job_roles WHERE company_document_id = cd.id
--     ) AND NOT EXISTS (
--       SELECT 1 FROM company_document_users WHERE company_document_id = cd.id
--     ) THEN 'Tem acesso (público)'
--     ELSE 'Sem acesso'
--   END as access_status
-- FROM company_documents cd
-- CROSS JOIN profiles p
-- WHERE cd.id = 'DOCUMENT_ID' AND p.display_name ILIKE '%esdras%';

-- 6. Verificar se o usuário "carol" tem acesso (substitua DOCUMENT_ID)
-- SELECT 
--   cd.id as document_id,
--   cd.name as document_name,
--   p.id as user_id,
--   p.display_name,
--   p.email,
--   CASE 
--     WHEN EXISTS (
--       SELECT 1 FROM company_document_users cdu 
--       WHERE cdu.company_document_id = cd.id AND cdu.user_id = p.id
--     ) THEN 'Tem acesso (usuário específico)'
--     WHEN EXISTS (
--       SELECT 1 FROM company_document_job_roles cdjr
--       JOIN profiles p2 ON p2.cargo_id = cdjr.job_role_id
--       WHERE cdjr.company_document_id = cd.id AND p2.id = p.id
--     ) THEN 'Tem acesso (por cargo)'
--     WHEN NOT EXISTS (
--       SELECT 1 FROM company_document_job_roles WHERE company_document_id = cd.id
--     ) AND NOT EXISTS (
--       SELECT 1 FROM company_document_users WHERE company_document_id = cd.id
--     ) THEN 'Tem acesso (público)'
--     ELSE 'Sem acesso'
--   END as access_status
-- FROM company_documents cd
-- CROSS JOIN profiles p
-- WHERE cd.id = 'DOCUMENT_ID' AND p.display_name ILIKE '%carol%';


