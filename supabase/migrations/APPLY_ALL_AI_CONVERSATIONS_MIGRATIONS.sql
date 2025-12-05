-- =====================================================
-- MIGRAÇÃO CONSOLIDADA: Sistema de Conversas de IA
-- =====================================================
-- Este arquivo contém todas as migrações necessárias para o sistema de conversas de IA
-- Execute este arquivo no Supabase SQL Editor ou via CLI
-- =====================================================

-- =====================================================
-- PARTE 1: Criar tabelas e estrutura básica
-- =====================================================

-- Create table for AI conversations
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create table for AI messages
CREATE TABLE IF NOT EXISTS public.ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_company_id ON public.ai_conversations(company_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_updated_at ON public.ai_conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON public.ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created_at ON public.ai_messages(created_at);

-- Enable RLS
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PARTE 2: Criar função do trigger com SECURITY DEFINER
-- =====================================================

-- Function to update updated_at timestamp
-- Using SECURITY DEFINER to bypass RLS for the trigger
CREATE OR REPLACE FUNCTION update_ai_conversation_updated_at()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.ai_conversations
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation updated_at when a message is inserted
DROP TRIGGER IF EXISTS update_conversation_on_message_insert ON public.ai_messages;
CREATE TRIGGER update_conversation_on_message_insert
  AFTER INSERT ON public.ai_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_conversation_updated_at();

-- =====================================================
-- PARTE 3: Criar políticas RLS com verificação de associação à empresa
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.ai_conversations;
DROP POLICY IF EXISTS "Users can insert their own conversations" ON public.ai_conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.ai_conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON public.ai_conversations;

-- RLS Policies for ai_conversations
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

-- =====================================================
-- PARTE 4: Políticas RLS para ai_messages
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view messages from their conversations" ON public.ai_messages;
DROP POLICY IF EXISTS "Users can insert messages to their conversations" ON public.ai_messages;
DROP POLICY IF EXISTS "Users can update messages from their conversations" ON public.ai_messages;
DROP POLICY IF EXISTS "Users can delete messages from their conversations" ON public.ai_messages;

-- Users can view messages from their conversations
CREATE POLICY "Users can view messages from their conversations"
  ON public.ai_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_conversations
      WHERE ai_conversations.id = ai_messages.conversation_id
      AND ai_conversations.user_id = auth.uid()
    )
  );

-- Users can insert messages to their conversations
CREATE POLICY "Users can insert messages to their conversations"
  ON public.ai_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_conversations
      WHERE ai_conversations.id = ai_messages.conversation_id
      AND ai_conversations.user_id = auth.uid()
    )
  );

-- Users can update messages from their conversations
CREATE POLICY "Users can update messages from their conversations"
  ON public.ai_messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_conversations
      WHERE ai_conversations.id = ai_messages.conversation_id
      AND ai_conversations.user_id = auth.uid()
    )
  );

-- Users can delete messages from their conversations
CREATE POLICY "Users can delete messages from their conversations"
  ON public.ai_messages
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_conversations
      WHERE ai_conversations.id = ai_messages.conversation_id
      AND ai_conversations.user_id = auth.uid()
    )
  );

-- =====================================================
-- FIM DA MIGRAÇÃO
-- =====================================================
-- Verifique se todas as políticas foram criadas corretamente:
-- SELECT * FROM pg_policies WHERE tablename IN ('ai_conversations', 'ai_messages');
-- =====================================================
