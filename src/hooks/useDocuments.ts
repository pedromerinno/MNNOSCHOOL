
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { DocumentType } from "@/types/document";
import { useDocumentsState } from './documents/useDocumentsState';
import { useDocumentPermissions } from './documents/useDocumentPermissions';
import { useDocumentUploadOperations } from './documents/useDocumentUploadOperations';
import { useDocumentDeleteOperations } from './documents/useDocumentDeleteOperations';

export const useDocuments = () => {
  const {
    documents,
    setDocuments,
    isLoading,
    setIsLoading,
    error,
    setError,
    isUploading,
    setIsUploading,
    currentUserId,
    setCurrentUserId
  } = useDocumentsState();

  const { canDeleteDocument } = useDocumentPermissions(currentUserId);
  
  const { uploadDocument } = useDocumentUploadOperations(
    currentUserId, 
    null, // Note: companyId should be passed from the component using this hook
    setDocuments,
    setIsUploading
  );
  
  const { deleteDocument } = useDocumentDeleteOperations(setDocuments);

  useEffect(() => {
    const fetchUserId = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUserId(data.user?.id || null);
    };
    
    fetchUserId();
  }, [setCurrentUserId]);

  return {
    documents,
    isLoading,
    error,
    isUploading,
    canDeleteDocument,
    handleUpload: uploadDocument,
    deleteDocument
  };
};
