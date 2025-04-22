
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useStorageOperations } from './useStorageOperations';

export const useDocumentDelete = () => {
  const { deleteFromStorage } = useStorageOperations();

  const deleteDocument = useCallback(async (documentId: string): Promise<boolean> => {
    try {
      // Buscar detalhes do documento antes de excluir
      const { data: document, error: fetchError } = await supabase
        .from('user_documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (fetchError || !document) {
        throw new Error(fetchError?.message || "Documento não encontrado");
      }

      // Primeiro excluir o arquivo do storage
      await deleteFromStorage(document.file_path);

      // Depois excluir o registro do banco
      const { error: deleteError } = await supabase
        .from('user_documents')
        .delete()
        .eq('id', documentId);

      if (deleteError) throw deleteError;

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
