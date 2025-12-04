-- =====================================================
-- FASE 5: NORMALIZAÇÃO E OTIMIZAÇÃO DE ESTRUTURA
-- =====================================================
-- 
-- Esta migração:
-- 1. Adiciona constraints onde necessário
-- 2. Otimiza tipos de dados (usar ENUMs onde apropriado)
-- 3. Adiciona validações e checks
-- 4. Melhora integridade referencial
--
-- RISCO: MÉDIO - Modifica estrutura mas não dados
-- IMPACTO: ALTO - Melhora integridade e performance
-- =====================================================

-- =====================================================
-- PARTE 1: CRIAR TIPOS ENUM PARA VALORES FIXOS
-- =====================================================

-- Tipo de contrato (já usado em user_empresa e user_invites)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_contrato_enum') THEN
    CREATE TYPE public.tipo_contrato_enum AS ENUM ('CLT', 'PJ', 'Fornecedor');
  END IF;
END $$;

-- Nível de colaborador (já usado em user_empresa e user_invites)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'nivel_colaborador_enum') THEN
    CREATE TYPE public.nivel_colaborador_enum AS ENUM ('Junior', 'Pleno', 'Senior');
  END IF;
END $$;

-- Tipo de anexo (já usado em company_documents e user_documents)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attachment_type_enum') THEN
    CREATE TYPE public.attachment_type_enum AS ENUM ('file', 'link');
  END IF;
END $$;

-- Tipo de mídia (já usado em settings)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_type_enum') THEN
    CREATE TYPE public.media_type_enum AS ENUM ('video', 'image');
  END IF;
END $$;

-- Status de discussão (já usado em discussions)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'discussion_status_enum') THEN
    CREATE TYPE public.discussion_status_enum AS ENUM ('open', 'closed', 'archived');
  END IF;
END $$;

-- Tipo de notificação (já usado em user_notifications)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type_enum') THEN
    CREATE TYPE public.notification_type_enum AS ENUM ('notice', 'course', 'lesson', 'discussion', 'feedback', 'system');
  END IF;
END $$;

-- =====================================================
-- PARTE 2: ADICIONAR CONSTRAINTS E VALIDAÇÕES
-- =====================================================

-- Adicionar constraint para garantir que email seja único em profiles (se ainda não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_email_unique'
  ) THEN
    CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email_unique 
    ON public.profiles(email) 
    WHERE email IS NOT NULL;
  END IF;
END $$;

-- Adicionar constraint para garantir unicidade de user_id + empresa_id em user_empresa (já existe, mas vamos garantir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_empresa_user_id_company_id_key'
  ) THEN
    ALTER TABLE public.user_empresa
    ADD CONSTRAINT user_empresa_user_id_company_id_key 
    UNIQUE (user_id, empresa_id);
  END IF;
END $$;

-- Adicionar constraint para garantir unicidade de empresa_id + course_id em company_courses (já existe, mas vamos garantir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'company_courses_company_id_course_id_key'
  ) THEN
    ALTER TABLE public.company_courses
    ADD CONSTRAINT company_courses_company_id_course_id_key 
    UNIQUE (empresa_id, course_id);
  END IF;
END $$;

-- Adicionar constraint para garantir unicidade de user_id + course_id em user_course_progress (já existe, mas vamos garantir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_course_progress_user_id_course_id_key'
  ) THEN
    ALTER TABLE public.user_course_progress
    ADD CONSTRAINT user_course_progress_user_id_course_id_key 
    UNIQUE (user_id, course_id);
  END IF;
END $$;

-- Adicionar constraint para garantir unicidade de user_id + lesson_id em user_lesson_progress (já existe, mas vamos garantir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_lesson_progress_user_id_lesson_id_key'
  ) THEN
    ALTER TABLE public.user_lesson_progress
    ADD CONSTRAINT user_lesson_progress_user_id_lesson_id_key 
    UNIQUE (user_id, lesson_id);
  END IF;
END $$;

-- Adicionar constraint para garantir que progress esteja entre 0 e 100
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_course_progress_progress_check'
  ) THEN
    ALTER TABLE public.user_course_progress
    ADD CONSTRAINT user_course_progress_progress_check 
    CHECK (progress >= 0 AND progress <= 100);
  END IF;
END $$;

-- Adicionar constraint para garantir que order_index seja não-negativo
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'lessons_order_index_check'
  ) THEN
    ALTER TABLE public.lessons
    ADD CONSTRAINT lessons_order_index_check 
    CHECK (order_index >= 0);
  END IF;
END $$;

-- Adicionar constraint para garantir que order_index seja não-negativo em company_videos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'company_videos_order_index_check'
  ) THEN
    ALTER TABLE public.company_videos
    ADD CONSTRAINT company_videos_order_index_check 
    CHECK (order_index >= 0);
  END IF;
END $$;

-- Adicionar constraint para garantir que order_index seja não-negativo em job_roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'job_roles_order_index_check'
  ) THEN
    ALTER TABLE public.job_roles
    ADD CONSTRAINT job_roles_order_index_check 
    CHECK (order_index >= 0);
  END IF;
END $$;

-- Adicionar constraint para garantir que cor_principal seja um hex válido
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'empresas_cor_principal_check'
  ) THEN
    ALTER TABLE public.empresas
    ADD CONSTRAINT empresas_cor_principal_check 
    CHECK (cor_principal IS NULL OR cor_principal ~ '^#[0-9A-Fa-f]{6}$');
  END IF;
END $$;

-- =====================================================
-- PARTE 3: ADICIONAR ÍNDICES PARA CONSTRAINTS E PERFORMANCE
-- =====================================================

-- Índice para busca rápida de usuários por email
CREATE INDEX IF NOT EXISTS idx_profiles_email 
  ON public.profiles(email) 
  WHERE email IS NOT NULL;

-- Índice para busca rápida de empresas por nome
CREATE INDEX IF NOT EXISTS idx_empresas_nome 
  ON public.empresas(nome);

-- Índice para busca rápida de cursos por título
CREATE INDEX IF NOT EXISTS idx_courses_title 
  ON public.courses(title);

-- Índice para busca rápida de lições por título
CREATE INDEX IF NOT EXISTS idx_lessons_title 
  ON public.lessons(title);

-- Índice composto para notificações não lidas por usuário
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_unread 
  ON public.user_notifications(user_id, read, created_at DESC) 
  WHERE read = false;

-- Índice para busca de discussões por status
CREATE INDEX IF NOT EXISTS idx_discussions_status 
  ON public.discussions(status) 
  WHERE status IS NOT NULL;

-- Índice para busca de avisos por visibilidade
CREATE INDEX IF NOT EXISTS idx_company_notices_visibilidade 
  ON public.company_notices(visibilidade, created_at DESC) 
  WHERE visibilidade = true;

-- =====================================================
-- PARTE 4: ADICIONAR TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em tabelas que têm updated_at mas não têm trigger
DO $$
DECLARE
  table_name TEXT;
  tables_to_update TEXT[] := ARRAY[
    'profiles',
    'empresas',
    'courses',
    'lessons',
    'company_documents',
    'company_notices',
    'job_roles',
    'user_empresa',
    'user_course_progress',
    'user_lesson_progress',
    'user_notes',
    'user_access',
    'discussions',
    'discussion_replies'
  ];
BEGIN
  FOREACH table_name IN ARRAY tables_to_update
  LOOP
    -- Verificar se a tabela tem coluna updated_at
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = table_name
      AND column_name = 'updated_at'
    ) THEN
      -- Remover trigger existente se houver
      EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I', table_name, table_name);
      
      -- Criar novo trigger
      EXECUTE format('
        CREATE TRIGGER update_%I_updated_at
        BEFORE UPDATE ON public.%I
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column()',
        table_name, table_name
      );
    END IF;
  END LOOP;
END $$;

-- =====================================================
-- PARTE 5: ADICIONAR COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

-- Comentários em tabelas principais
COMMENT ON TABLE public.profiles IS 'Perfis de usuários. Contém apenas dados pessoais globais. Dados por empresa estão em user_empresa.';
COMMENT ON TABLE public.user_empresa IS 'Associação entre usuários e empresas. Cada registro representa um usuário em uma empresa específica, com role (is_admin) e cargo (cargo_id) próprios para aquela empresa.';
COMMENT ON TABLE public.empresas IS 'Empresas cadastradas no sistema. Cada empresa pode ter múltiplos usuários e configurações próprias.';
COMMENT ON TABLE public.courses IS 'Cursos disponíveis no sistema. Podem ser associados a empresas via company_courses.';
COMMENT ON TABLE public.lessons IS 'Lições que compõem os cursos. Ordenadas por order_index dentro de cada curso.';
COMMENT ON TABLE public.company_courses IS 'Associação entre empresas e cursos. Define quais cursos cada empresa tem acesso.';
COMMENT ON TABLE public.user_course_progress IS 'Progresso de usuários em cursos. Uma entrada por usuário por curso.';
COMMENT ON TABLE public.user_lesson_progress IS 'Progresso de usuários em lições. Uma entrada por usuário por lição.';

-- Comentários em colunas importantes
COMMENT ON COLUMN public.user_empresa.is_admin IS 'Indica se o usuário é admin desta empresa específica. Permite que o mesmo usuário seja admin em uma empresa e não em outra.';
COMMENT ON COLUMN public.user_empresa.cargo_id IS 'Cargo do usuário nesta empresa específica. Permite que o mesmo usuário tenha cargos diferentes em empresas diferentes.';
COMMENT ON COLUMN public.user_empresa.tipo_contrato IS 'Tipo de contrato nesta empresa: CLT, PJ ou Fornecedor';
COMMENT ON COLUMN public.user_empresa.nivel_colaborador IS 'Nível do colaborador nesta empresa: Junior, Pleno ou Senior';
COMMENT ON COLUMN public.profiles.super_admin IS 'Indica se o usuário é super admin do sistema. Super admins têm acesso a todas as empresas.';
COMMENT ON COLUMN public.empresas.cor_principal IS 'Cor principal da empresa em formato hexadecimal (#RRGGBB). Usada para personalização da interface.';

-- =====================================================
-- PARTE 6: OTIMIZAÇÕES FINAIS
-- =====================================================

-- Adicionar constraint NOT NULL onde faz sentido (após verificar dados existentes)
-- NOTA: Estas alterações podem falhar se houver dados NULL existentes
-- Descomente apenas após garantir que não há dados NULL

-- ALTER TABLE public.profiles ALTER COLUMN display_name SET NOT NULL;
-- ALTER TABLE public.empresas ALTER COLUMN nome SET NOT NULL;
-- ALTER TABLE public.courses ALTER COLUMN title SET NOT NULL;
-- ALTER TABLE public.lessons ALTER COLUMN title SET NOT NULL;
-- ALTER TABLE public.lessons ALTER COLUMN course_id SET NOT NULL;
-- ALTER TABLE public.lessons ALTER COLUMN order_index SET NOT NULL;

-- =====================================================
-- FIM DA MIGRAÇÃO FASE 5
-- =====================================================
-- 
-- RESUMO DAS MELHORIAS:
-- 1. Criados tipos ENUM para valores fixos (melhora integridade e performance)
-- 2. Adicionados constraints de unicidade e validação
-- 3. Adicionados índices para melhorar performance de queries
-- 4. Adicionados triggers para atualização automática de updated_at
-- 5. Adicionados comentários para documentação
-- 
-- PRÓXIMOS PASSOS:
-- 1. Revisar constraints NOT NULL comentadas e aplicar se apropriado
-- 2. Considerar migrar colunas text para usar ENUMs onde aplicável
-- 3. Monitorar performance após aplicação das mudanças
-- =====================================================



