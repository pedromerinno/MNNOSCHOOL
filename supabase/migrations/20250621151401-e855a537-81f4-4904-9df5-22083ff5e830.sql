
-- Adicionar foreign keys para as tabelas de documentos da empresa (apenas as que não existem)
DO $$ 
BEGIN
    -- Adicionar FK para company_id se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_company_documents_company_id'
    ) THEN
        ALTER TABLE public.company_documents 
        ADD CONSTRAINT fk_company_documents_company_id 
        FOREIGN KEY (company_id) REFERENCES public.empresas(id) ON DELETE CASCADE;
    END IF;

    -- Adicionar FK para created_by se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_company_documents_created_by'
    ) THEN
        ALTER TABLE public.company_documents 
        ADD CONSTRAINT fk_company_documents_created_by 
        FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;

    -- Adicionar FK para company_document_id se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_company_document_job_roles_document_id'
    ) THEN
        ALTER TABLE public.company_document_job_roles 
        ADD CONSTRAINT fk_company_document_job_roles_document_id 
        FOREIGN KEY (company_document_id) REFERENCES public.company_documents(id) ON DELETE CASCADE;
    END IF;

    -- Adicionar FK para job_role_id se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_company_document_job_roles_job_role_id'
    ) THEN
        ALTER TABLE public.company_document_job_roles 
        ADD CONSTRAINT fk_company_document_job_roles_job_role_id 
        FOREIGN KEY (job_role_id) REFERENCES public.job_roles(id) ON DELETE CASCADE;
    END IF;
END $$;
