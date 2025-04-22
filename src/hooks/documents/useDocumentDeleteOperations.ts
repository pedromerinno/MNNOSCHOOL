
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserDocument } from '@/types/document';
import { useStorageOperations } from './useStorageOperations';

export const useDocumentDeleteOperations = (
  setDocuments: React.Dispatch<React.SetStateAction<UserDocument[]>>
) => {
  const { deleteFromStorage } = useStorageOperations();

  const deleteDocument = useCallback(async (documentId: string): Promise<boolean> => {
    if (!documentId) {
      toast.error("ID do documento não fornecido");
      return false;
    }

    try {
      console.log("Iniciando exclusão do documento:", documentId);
      
      // Fetch document details
      const { data: document, error: fetchError } = await supabase
        .from('user_documents')
        .select('file_path')
        .eq('id', documentId)
        .single();

      if (fetchError) {
        console.error("Erro ao buscar detalhes do documento:", fetchError);
        throw new Error(`Não foi possível obter informações do documento: ${fetchError.message}`);
      }

      if (!document) {
        toast.error("Documento não encontrado");
        return false;
      }

      console.log("Documento encontrado:", document);

      // Get current authenticated user to verify permissions
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error("Erro de autenticação:", authError);
        toast.error("Usuário não autenticado");
        return false;
      }

      console.log("Tentando remover arquivo:", document.file_path);
      
      // Try to remove the file from storage
      try {
        await deleteFromStorage(document.file_path);
      } catch (storageError: any) {
        console.warn("Erro ao remover arquivo do storage:", storageError);
        console.log("Continuando com exclusão do registro no banco de dados...");
        // Continue with database record deletion even if file removal fails
      }

      console.log("Removendo registro do banco de dados...");
      
      // Delete the database record - this will be checked against RLS policies
      const { error: deleteError } = await supabase
        .from('user_documents')
        .delete()
        .eq('id', documentId);

      if (deleteError) {
        console.error("Erro ao excluir registro do documento:", deleteError);
        
        if (deleteError.message.includes("permission denied")) {
          throw new Error("Você não tem permissão para excluir este documento");
        } else {
          throw new Error(`Falha ao excluir o registro do documento: ${deleteError.message}`);
        }
      }

      console.log("Documento excluído com sucesso!");
      
      // Update the state to remove the deleted document
      setDocuments(currentDocs => currentDocs.filter(doc => doc.id !== documentId));
      toast.success('Documento excluído com sucesso');
      return true;
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error(`Falha ao excluir o documento: ${error.message}`);
      return false;
    }
  }, [setDocuments, deleteFromStorage]);

  return { deleteDocument };
};
