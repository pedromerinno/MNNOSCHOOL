
-- Add visibility column to company_notices table
ALTER TABLE public.company_notices 
ADD COLUMN visibilidade boolean NOT NULL DEFAULT true;
