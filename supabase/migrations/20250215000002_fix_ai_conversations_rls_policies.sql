-- Fix RLS policies for ai_conversations to verify user belongs to company
-- This ensures users can only create conversations for companies they are associated with

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.ai_conversations;
DROP POLICY IF EXISTS "Users can insert their own conversations" ON public.ai_conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.ai_conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON public.ai_conversations;

-- Recreate policies with company membership verification

-- Users can only see their own conversations for companies they belong to
CREATE POLICY "Users can view their own conversations"
  ON public.ai_conversations
  FOR SELECT
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.user_empresa
      WHERE user_empresa.user_id = auth.uid()
      AND user_empresa.empresa_id = ai_conversations.company_id
    )
  );

-- Users can insert their own conversations for companies they belong to
CREATE POLICY "Users can insert their own conversations"
  ON public.ai_conversations
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.user_empresa
      WHERE user_empresa.user_id = auth.uid()
      AND user_empresa.empresa_id = ai_conversations.company_id
    )
  );

-- Users can update their own conversations
CREATE POLICY "Users can update their own conversations"
  ON public.ai_conversations
  FOR UPDATE
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.user_empresa
      WHERE user_empresa.user_id = auth.uid()
      AND user_empresa.empresa_id = ai_conversations.company_id
    )
  );

-- Users can delete their own conversations
CREATE POLICY "Users can delete their own conversations"
  ON public.ai_conversations
  FOR DELETE
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.user_empresa
      WHERE user_empresa.user_id = auth.uid()
      AND user_empresa.empresa_id = ai_conversations.company_id
    )
  );

