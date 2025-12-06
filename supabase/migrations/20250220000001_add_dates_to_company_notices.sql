-- Add date fields to company_notices table for scheduling visibility
ALTER TABLE public.company_notices 
ADD COLUMN IF NOT EXISTS data_inicio TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS data_fim TIMESTAMPTZ;

-- Create indexes for better query performance when filtering by dates
CREATE INDEX IF NOT EXISTS idx_company_notices_data_inicio ON public.company_notices(data_inicio);
CREATE INDEX IF NOT EXISTS idx_company_notices_data_fim ON public.company_notices(data_fim);

-- Add comment to explain the fields
COMMENT ON COLUMN public.company_notices.data_inicio IS 'Data de início da visibilidade do aviso (agendamento)';
COMMENT ON COLUMN public.company_notices.data_fim IS 'Data de término da visibilidade do aviso';
