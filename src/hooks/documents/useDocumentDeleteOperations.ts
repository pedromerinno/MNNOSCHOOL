
import { useCallback } from 'react';
import { toast } from "sonner";
import { UserDocument } from '@/types/document';
import { useDocumentDelete } from './useDocumentDelete';

export const useDocumentDeleteOperations = (
  setDocuments: React.Dispatch<React.SetStateAction<UserDocument[]>>
) => {
  const { deleteDocument } = useDocumentDelete();

  const deleteDocumentWithState = useCallback(async (documentId: string): Promise<boolean> => {
    try {
      console.log("Iniciando exclusão do documento com atualização de estado:", documentId);
      
      // Chamar a função de exclusão
      const success = await deleteDocument(documentId);
      
      if (success) {
        // Atualizar o estado para remover o documento excluído
        setDocuments(currentDocs => currentDocs.filter(doc => doc.id !== documentId));
        console.log("Estado atualizado após exclusão bem-sucedida");
      }
      
      return success;
    } catch (error: any) {
      console.error('Erro ao excluir documento com atualização de estado:', error);
      toast.error(`Falha ao excluir o documento: ${error.message}`);
      return false;
    }
  }, [deleteDocument, setDocuments]);

  return { deleteDocument: deleteDocumentWithState };
};
