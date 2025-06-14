
import { useState, useEffect, useCallback, useRef } from 'react';
import { UserDocument, DocumentType } from "@/types/document";
import { useDocumentFetching } from './useDocumentFetching';
import { useDocumentDownload } from './useDocumentDownload';
import { useDocumentDelete } from './useDocumentDelete';
import { useDocumentUpload } from './useDocumentUpload';
import { useDocumentPreview } from './useDocumentPreview';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanies } from '@/hooks/useCompanies';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useDocumentManagerOptimized = () => {
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  
  const { user } = useAuth();
  const { selectedCompany } = useCompanies();
  const { fetchDocumentsForUser } = useDocumentFetching();
  const { downloadDocument } = useDocumentDownload();
  const { deleteDocument } = useDocumentDelete();
  const { uploadDocument } = useDocumentUpload();
  const { previewUrl, previewOpen, setPreviewOpen, handlePreview } = useDocumentPreview();
  
  // Controle para evitar múltiplas chamadas
  const isFetchingRef = useRef(false);
  const lastFetchParamsRef = useRef<string>('');
  
  const fetchDocuments = useCallback(async () => {
    if (!user?.id || !selectedCompany?.id) {
      setDocuments([]);
      setIsLoading(false);
      return;
    }

    const currentParams = `${user.id}-${selectedCompany.id}`;
    
    // Evitar chamadas duplicadas
    if (isFetchingRef.current || lastFetchParamsRef.current === currentParams) {
      return;
    }

    try {
      isFetchingRef.current = true;
      lastFetchParamsRef.current = currentParams;
      
      console.log(`[DocumentManager] Fetching documents for user ${user.id} and company ${selectedCompany.id}`);
      
      const fetchedDocuments = await fetchDocumentsForUser(user.id, selectedCompany.id);
      setDocuments(fetchedDocuments);
    } catch (error: any) {
      console.error('[DocumentManager] Error fetching documents:', error);
      toast.error('Erro ao carregar documentos');
      setDocuments([]);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [user?.id, selectedCompany?.id, fetchDocumentsForUser]);

  // Fetch inicial apenas quando necessário
  useEffect(() => {
    if (user?.id && selectedCompany?.id) {
      const currentParams = `${user.id}-${selectedCompany.id}`;
      
      // Só buscar se os parâmetros mudaram
      if (lastFetchParamsRef.current !== currentParams) {
        setIsLoading(true);
        fetchDocuments();
      }
    } else {
      setDocuments([]);
      setIsLoading(false);
      lastFetchParamsRef.current = '';
    }
  }, [user?.id, selectedCompany?.id, fetchDocuments]);

  // Função para upload de links
  const uploadDocumentLink = useCallback(async (
    linkUrl: string,
    name: string,
    documentType: DocumentType,
    description: string
  ): Promise<boolean> => {
    if (!user?.id || !selectedCompany?.id) {
      toast.error('Usuário ou empresa não encontrados');
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_documents')
        .insert({
          user_id: user.id,
          company_id: selectedCompany.id,
          name: name,
          link_url: linkUrl,
          attachment_type: 'link',
          document_type: documentType,
          description: description || null,
          uploaded_by: user.id
        });

      if (error) throw error;
      
      return true;
    } catch (error: any) {
      console.error('Erro ao adicionar link do documento:', error);
      toast.error('Erro ao adicionar link');
      return false;
    }
  }, [user?.id, selectedCompany?.id]);

  const handleDocumentUpload = useCallback(async (
    attachmentType: 'file' | 'link',
    fileOrUrl: File | string,
    documentType: DocumentType,
    description: string,
    name: string
  ): Promise<boolean> => {
    if (!user?.id || !selectedCompany?.id) {
      toast.error('Usuário ou empresa não encontrados');
      return false;
    }

    try {
      setIsUploading(true);
      
      let success = false;
      
      if (attachmentType === 'file' && fileOrUrl instanceof File) {
        // Para arquivos, usar o hook de upload
        success = await uploadDocument(fileOrUrl, documentType, description);
      } else if (attachmentType === 'link' && typeof fileOrUrl === 'string') {
        // Para links, usar nossa função específica
        success = await uploadDocumentLink(fileOrUrl, name, documentType, description);
      }

      if (success) {
        // Refresh documents after successful upload
        await fetchDocuments();
        toast.success(attachmentType === 'file' ? 'Documento enviado com sucesso!' : 'Link adicionado com sucesso!');
      }

      return success;
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.error('Erro ao enviar documento');
      return false;
    } finally {
      setIsUploading(false);
    }
  }, [user?.id, selectedCompany?.id, uploadDocument, uploadDocumentLink, fetchDocuments]);

  const handleDelete = useCallback(async (documentId: string) => {
    try {
      const success = await deleteDocument(documentId);
      
      if (success) {
        // Remove document from local state instead of refetching
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        toast.success('Documento excluído com sucesso');
      }
      
      return success;
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error('Erro ao excluir documento');
      return false;
    }
  }, [deleteDocument]);

  const canDeleteDocument = useCallback((document: UserDocument) => {
    return document.user_id === user?.id;
  }, [user?.id]);

  const refreshDocuments = useCallback(async () => {
    // Reset fetch control to allow fresh fetch
    lastFetchParamsRef.current = '';
    await fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents,
    isLoading,
    isUploading,
    uploadOpen,
    setUploadOpen,
    previewUrl,
    previewOpen,
    setPreviewOpen,
    downloadDocument,
    handlePreview,
    handleDelete,
    handleDocumentUpload,
    canDeleteDocument,
    refreshDocuments
  };
};
