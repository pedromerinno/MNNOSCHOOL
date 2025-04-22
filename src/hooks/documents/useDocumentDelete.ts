
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useStorageOperations } from './useStorageOperations';

export const useDocumentDelete = () => {
  const { deleteFromStorage } = useStorageOperations();

  const deleteDocument = useCallback(async (documentId: string): Promise<boolean> => {
    try {
      console.log("Iniciando processo de exclusão do documento:", documentId);
      
      if (!documentId) {
        toast.error("ID do documento não fornecido");
        return false;
      }

      // Buscar detalhes do documento antes de excluir
      const { data: document, error: fetchError } = await supabase
        .from('user_documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (fetchError) {
        console.error("Erro ao buscar documento:", fetchError);
        toast.error(`Não foi possível encontrar o documento: ${fetchError.message}`);
        return false;
      }

      if (!document) {
        toast.error("Documento não encontrado");
        return false;
      }

      console.log("Documento encontrado:", document);

      // Tentar remover o arquivo do storage, mas continuar mesmo se falhar
      try {
        console.log("Tentando remover arquivo do storage:", document.file_path);
        // Primeiro verificar se o bucket existe
        const { data: buckets } = await supabase.storage.listBuckets();
        const bucketExists = buckets?.some(bucket => bucket.name === 'documents');
        
        if (!bucketExists) {
          console.warn("Bucket 'documents' não encontrado. Verificando se o arquivo pode ser excluído do banco de dados.");
        } else {
          const result = await deleteFromStorage(document.file_path);
          console.log("Resultado da exclusão do arquivo no storage:", result);
        }
      } catch (storageError) {
        // Log do erro, mas continuar com a exclusão do registro no banco
        console.warn("Erro ao excluir do storage, continuando com exclusão do registro:", storageError);
      }

      // Excluir o registro do documento no banco de dados
      console.log("Excluindo registro do documento no banco de dados...");
      const { error: deleteError } = await supabase
        .from('user_documents')
        .delete()
        .eq('id', documentId);

      if (deleteError) {
        console.error("Erro ao excluir registro do documento:", deleteError);
        toast.error(`Falha ao excluir o documento do banco de dados: ${deleteError.message}`);
        return false;
      }

      console.log("Documento excluído com sucesso!");
      toast.success("Documento excluído com sucesso");
      return true;
    } catch (error: any) {
      console.error("Erro na operação de exclusão do documento:", error);
      toast.error(`Erro ao excluir documento: ${error.message}`);
      return false;
    }
  }, [deleteFromStorage]);

  return { deleteDocument };
};
