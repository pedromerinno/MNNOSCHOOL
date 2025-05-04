
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useStorageOperations } from './useStorageOperations';
import { DOCUMENTS_BUCKET } from './constants';

export const useDocumentDelete = () => {
  const { deleteFromStorage } = useStorageOperations();

  const deleteDocument = useCallback(async (documentId: string): Promise<boolean> => {
    try {
      console.log("Iniciando exclusão do documento:", documentId);
      
      // Buscar detalhes do documento antes de excluir
      const { data: document, error: fetchError } = await supabase
        .from('user_documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (fetchError || !document) {
        console.error("Erro ao buscar documento:", fetchError);
        throw new Error(fetchError?.message || "Documento não encontrado");
      }

      console.log("Documento encontrado:", document);

      // Primeiro excluir o registro do banco
      const { error: deleteError } = await supabase
        .from('user_documents')
        .delete()
        .eq('id', documentId);

      if (deleteError) {
        console.error("Erro ao excluir registro do documento:", deleteError);
        throw deleteError;
      }

      console.log("Registro do documento excluído, tentando excluir arquivo:", document.file_path);

      // Depois tentar excluir o arquivo do storage (sem bloquear em caso de falha)
      const storageSuccess = await deleteFromStorage(document.file_path);
      
      if (!storageSuccess) {
        console.warn("O arquivo não foi excluído, mas o registro foi removido com sucesso");
      }

      toast.success("Documento excluído com sucesso");
      return true;
    } catch (error: any) {
      console.error("Erro ao excluir documento:", error);
      toast.error(`Falha ao excluir o documento: ${error.message}`);
      return false;
    }
  }, [deleteFromStorage]);

  return { deleteDocument };
};
