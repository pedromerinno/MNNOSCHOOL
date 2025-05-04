
import { useCallback } from 'react';
import { UserDocument } from "@/types/document";
import { supabase } from "@/integrations/supabase/client";

export const useDocumentPermissions = (currentUserId: string | null) => {
  const canDeleteDocument = useCallback((document: UserDocument): boolean => {
    if (!currentUserId || !document) return false;
    
    // Um usuário só pode excluir um documento se ele:
    // Foi quem fez o upload desse documento (uploaded_by)
    return document.uploaded_by === currentUserId;
  }, [currentUserId]);

  return { canDeleteDocument };
};
