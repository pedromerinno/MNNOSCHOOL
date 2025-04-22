
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useDocumentValidation } from './useDocumentValidation';
import { UserDocument } from '@/types/document';

export const useDocumentDeleteOperations = (
  setDocuments: React.Dispatch<React.SetStateAction<UserDocument[]>>
) => {
  const { createBucketIfNotExists } = useDocumentValidation();

  const deleteDocument = useCallback(async (documentId: string): Promise<boolean> => {
    if (!documentId) {
      toast.error("ID do documento não fornecido");
      return false;
    }

    try {
      // Fetch document details
      const { data: document, error: fetchError } = await supabase
        .from('user_documents')
        .select('file_path, uploaded_by, user_id')
        .eq('id', documentId)
        .single();

      if (fetchError) {
        console.error("Erro ao buscar detalhes do documento:", fetchError);
        throw fetchError;
      }

      if (!document) {
        toast.error("Documento não encontrado");
        return false;
      }

      // Get current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Usuário não autenticado");
        return false;
      }

      // Check if user is admin 
      const { data: profileData } = await supabase
        .from('profiles')
        .select('is_admin, super_admin')
        .eq('id', user.id)
        .single();
        
      const isAdmin = profileData?.is_admin || profileData?.super_admin;

      // Only allow deletion if user is the uploader or an admin
      if (document.uploaded_by !== user.id && !isAdmin) {
        toast.error("Você só pode excluir documentos que você mesmo enviou");
        return false;
      }

      // Create bucket if it doesn't exist - this is automatic now
      const bucketExists = await createBucketIfNotExists();
      
      if (!bucketExists) {
        // Retry once more with forceful creation
        console.log("Retry bucket creation forcefully");
        const { error } = await supabase.storage.createBucket('documents', {
          public: false,
          fileSizeLimit: 10485760, // 10MB
        });
        
        if (error) {
          console.error("Segunda tentativa falhou:", error);
          toast.error("Não foi possível acessar o armazenamento. Tente novamente mais tarde.");
          return false;
        }
      }

      // Try to remove the file, but continue even if it fails
      try {
        const { error: removeError } = await supabase.storage
          .from('documents')
          .remove([document.file_path]);

        if (removeError) {
          console.warn("Warning during file removal:", removeError);
          // Continue with database record deletion even if file removal fails
        }
      } catch (storageError) {
        console.warn("Erro ao remover arquivo do storage:", storageError);
        // Don't return false here, we still want to delete the database record
      }

      // Delete the database record
      const { error: deleteError } = await supabase
        .from('user_documents')
        .delete()
        .eq('id', documentId);

      if (deleteError) {
        console.error("Erro ao excluir registro do documento:", deleteError);
        throw deleteError;
      }

      // Update the state to remove the deleted document
      setDocuments(currentDocs => currentDocs.filter(doc => doc.id !== documentId));
      toast.success('Documento excluído com sucesso');
      return true;
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error(`Erro ao excluir documento: ${error.message}`);
      return false;
    }
  }, [createBucketIfNotExists, setDocuments]);

  return { deleteDocument };
};
