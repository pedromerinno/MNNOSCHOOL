
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
      const { data: document, error: fetchError } = await supabase
        .from('user_documents')
        .select('file_path, uploaded_by')
        .eq('id', documentId)
        .single();

      if (fetchError) throw fetchError;

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!document || !user) {
        toast.error("Documento não encontrado ou usuário não autenticado");
        return false;
      }

      // Check if user is admin 
      const { data: profileData } = await supabase
        .from('profiles')
        .select('is_admin, super_admin')
        .eq('id', user.id)
        .single();
        
      const isAdmin = profileData?.is_admin || profileData?.super_admin;

      if (document.uploaded_by !== user.id && !isAdmin) {
        toast.error("Você só pode excluir documentos que você mesmo enviou");
        return false;
      }

      // Ensure bucket exists
      const bucketExists = await createBucketIfNotExists();
      
      if (!bucketExists) {
        toast.error("Sistema de armazenamento não está disponível. Tentando criar...");
        const retryBucketCheck = await createBucketIfNotExists();
        
        if (!retryBucketCheck) {
          toast.error("Não foi possível acessar o armazenamento. Contate o administrador.");
          return false;
        }
      }

      // Try to remove the file, but continue even if it fails (file might already be deleted)
      try {
        await supabase.storage
          .from('documents')
          .remove([document.file_path]);
      } catch (storageError) {
        console.warn("Erro ao remover arquivo do storage:", storageError);
        // Don't return false here, we still want to delete the database record
      }

      const { error: deleteError } = await supabase
        .from('user_documents')
        .delete()
        .eq('id', documentId);

      if (deleteError) throw deleteError;

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
