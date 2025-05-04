
import { useState, useEffect, useCallback } from 'react';
import { UserDocument } from '@/types/document';
import { useDocumentFetching } from './documents/useDocumentFetching';
import { useDocumentDownload } from './documents/useDocumentDownload';
import { useDocumentDelete } from './documents/useDocumentDelete';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanies } from '@/hooks/useCompanies';

export const useUserDocumentsViewer = () => {
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { fetchDocumentsForUser } = useDocumentFetching();
  const { downloadDocument } = useDocumentDownload();
  const { deleteDocument } = useDocumentDelete();
  const { user } = useAuth();
  const { selectedCompany } = useCompanies();
  
  const fetchUserDocuments = useCallback(async () => {
    if (!user?.id || !selectedCompany?.id) {
      setError("Usuário ou empresa não encontrados");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedDocuments = await fetchDocumentsForUser(user.id, selectedCompany.id);
      setDocuments(fetchedDocuments);
    } catch (err: any) {
      console.error("Erro ao buscar documentos:", err);
      setError(err.message || "Falha ao carregar documentos");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, selectedCompany?.id, fetchDocumentsForUser]);
  
  useEffect(() => {
    if (user?.id && selectedCompany?.id) {
      fetchUserDocuments();
    }
  }, [user?.id, selectedCompany?.id, fetchUserDocuments]);

  return {
    documents,
    isLoading,
    error,
    downloadDocument,
    deleteDocument,
    refreshDocuments: fetchUserDocuments
  };
};
