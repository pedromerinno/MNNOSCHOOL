
import { useEffect } from 'react';
import { useDocumentFetching } from './documents/useDocumentFetching';
import { useDocumentDownload } from './documents/useDocumentDownload';
import { useDocumentDelete } from './documents/useDocumentDelete';

export const useUserDocumentsViewer = () => {
  const { documents, isLoading, error, fetchUserDocuments } = useDocumentFetching();
  const { downloadDocument } = useDocumentDownload();
  const { deleteDocument } = useDocumentDelete();

  useEffect(() => {
    fetchUserDocuments();
  }, [fetchUserDocuments]);

  return {
    documents,
    isLoading,
    error,
    downloadDocument,
    deleteDocument,
    refreshDocuments: fetchUserDocuments
  };
};
