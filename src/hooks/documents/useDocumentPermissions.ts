
import { useCallback } from 'react';
import { UserDocument } from "@/types/document";
import { supabase } from "@/integrations/supabase/client";

export const useDocumentPermissions = (currentUserId: string | null) => {
  const canDeleteDocument = useCallback((document: UserDocument): boolean => {
    if (!currentUserId || !document) return false;
    
    // A user can delete a document if they:
    // 1. Uploaded it themselves
    // 2. Are the owner of the document
    // Note: Admins will be checked in a separate hook when needed
    return document.uploaded_by === currentUserId || document.user_id === currentUserId;
  }, [currentUserId]);

  return { canDeleteDocument };
};
