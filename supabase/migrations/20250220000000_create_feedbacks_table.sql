-- Create table for feedbacks
CREATE TABLE IF NOT EXISTS public.feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_feedbacks_admin_id ON public.feedbacks(admin_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_recipient_id ON public.feedbacks(recipient_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_company_id ON public.feedbacks(company_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON public.feedbacks(created_at DESC);

-- Enable RLS
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for feedbacks
-- Admins can view feedbacks for their company
CREATE POLICY "Admins can view company feedbacks"
  ON public.feedbacks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_empresa
      WHERE user_empresa.user_id = auth.uid()
      AND user_empresa.empresa_id = feedbacks.company_id
      AND (user_empresa.is_admin = true OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.super_admin = true
      ))
    )
    OR auth.uid() = recipient_id
  );

-- Admins can insert feedbacks for their company
CREATE POLICY "Admins can insert company feedbacks"
  ON public.feedbacks
  FOR INSERT
  WITH CHECK (
    auth.uid() = admin_id
    AND EXISTS (
      SELECT 1 FROM public.user_empresa
      WHERE user_empresa.user_id = auth.uid()
      AND user_empresa.empresa_id = feedbacks.company_id
      AND (user_empresa.is_admin = true OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.super_admin = true
      ))
    )
    AND EXISTS (
      SELECT 1 FROM public.user_empresa
      WHERE user_empresa.user_id = feedbacks.recipient_id
      AND user_empresa.empresa_id = feedbacks.company_id
    )
  );

-- Admins can update feedbacks they created
CREATE POLICY "Admins can update their own feedbacks"
  ON public.feedbacks
  FOR UPDATE
  USING (
    auth.uid() = admin_id
    AND EXISTS (
      SELECT 1 FROM public.user_empresa
      WHERE user_empresa.user_id = auth.uid()
      AND user_empresa.empresa_id = feedbacks.company_id
      AND (user_empresa.is_admin = true OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.super_admin = true
      ))
    )
  );

-- Admins can delete feedbacks they created
CREATE POLICY "Admins can delete their own feedbacks"
  ON public.feedbacks
  FOR DELETE
  USING (
    auth.uid() = admin_id
    AND EXISTS (
      SELECT 1 FROM public.user_empresa
      WHERE user_empresa.user_id = auth.uid()
      AND user_empresa.empresa_id = feedbacks.company_id
      AND (user_empresa.is_admin = true OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.super_admin = true
      ))
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_feedback_updated_at()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at when feedback is updated
CREATE TRIGGER update_feedback_updated_at_trigger
  BEFORE UPDATE ON public.feedbacks
  FOR EACH ROW
  EXECUTE FUNCTION update_feedback_updated_at();
