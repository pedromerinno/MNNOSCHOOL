-- Fix the trigger function to use SECURITY DEFINER to bypass RLS
-- This allows the trigger to update the updated_at timestamp without RLS blocking it

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
