
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDocumentDelete = () => {
  const deleteDocument = useCallback(async (documentId: string): Promise<void> => {
    if (!documentId) {
      toast.error("ID do documento não fornecido");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      const { data: document, error: fetchError } = await supabase
        .from('user_documents')
        .select('file_path, uploaded_by')
        .eq('id', documentId)
        .single();

      if (fetchError) throw fetchError;

      if (!document) {
        toast.error("Documento não encontrado");
        return;
      }

      if (document.uploaded_by !== user.id) {
        toast.error("Você só pode excluir documentos que você mesmo enviou");
        return;
      }

      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path]);

      if (storageError) {
        console.warn("Erro ao remover arquivo do storage:", storageError);
      }

      const { error: deleteError } = await supabase
        .from('user_documents')
        .delete()
        .eq('id', documentId);

      if (deleteError) throw deleteError;

      toast.success('Documento excluído com sucesso');
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error(`Erro ao excluir documento: ${error.message}`);
    }
  }, []);

  return { deleteDocument };
};
