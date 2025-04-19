
import { UserDocument } from "@/types/document";
import { useUserDocumentsViewer } from "@/hooks/useUserDocumentsViewer";

export const useDocumentDeletion = () => {
  const { deleteDocument, refreshDocuments } = useUserDocumentsViewer();

  const handleDelete = async (document: UserDocument): Promise<void> => {
    if (window.confirm(`Tem certeza que deseja excluir o documento "${document.name}"?`)) {
      await deleteDocument(document.id);
      refreshDocuments();
    }
  };

  return { handleDelete };
};
