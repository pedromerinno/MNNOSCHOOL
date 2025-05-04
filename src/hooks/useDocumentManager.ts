
import { useState, useEffect, useCallback } from 'react';
import { UserDocument, DocumentType } from "@/types/document";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUserDocumentsList } from './useUserDocumentsList';
import { useCompanies } from "@/hooks/useCompanies";

export const useDocumentManager = () => {
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { selectedCompany } = useCompanies();
  
  const {
    downloadingId,
    deletingId,
    previewUrl,
    previewOpen,
    setPreviewOpen,
    currentUserIsAdmin,
    handleDownload,
    handlePreview,
    confirmDelete,
    fetchDocumentsForUser
  } = useUserDocumentsList(handleDelete);

  // Buscar o ID do usuário atual
  useEffect(() => {
    const fetchUserData = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Erro ao buscar usuário:", error);
        return;
      }
      setCurrentUserId(data.user?.id || null);
    };
    fetchUserData();
  }, []);

  // Buscar documentos quando o usuário ou a empresa mudam
  useEffect(() => {
    const fetchDocuments = async () => {
      if (currentUserId && selectedCompany?.id) {
        setIsLoading(true);
        try {
          console.log(`Buscando documentos para usuário ${currentUserId} na empresa ${selectedCompany.id}`);
          const docs = await fetchDocumentsForUser(currentUserId, selectedCompany.id);
          setDocuments(docs);
        } catch (error) {
          console.error("Erro ao buscar documentos:", error);
          toast.error("Falha ao carregar documentos");
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchDocuments();
  }, [currentUserId, selectedCompany?.id, fetchDocumentsForUser]);

  // Função para verificar se o usuário pode excluir o documento
  const canDeleteDocument = useCallback((document: UserDocument): boolean => {
    if (!currentUserId) return false;
    
    // Usuário pode excluir se for o proprietário, quem enviou ou admin
    return document.uploaded_by === currentUserId || 
           document.user_id === currentUserId || 
           currentUserIsAdmin;
  }, [currentUserId, currentUserIsAdmin]);

  // Função para lidar com o upload de documentos
  const handleDocumentUpload = useCallback(async (
    file: File, 
    documentType: DocumentType,
    description: string
  ): Promise<boolean> => {
    if (!currentUserId) {
      toast.error("Usuário não autenticado");
      return false;
    }
    
    if (!selectedCompany?.id) {
      toast.error("Nenhuma empresa selecionada. Selecione uma empresa primeiro.");
      return false;
    }
    
    setIsUploading(true);
    
    try {
      // Upload file to storage
      const userDir = `user-documents/${currentUserId}`;
      const fileExt = file.name.split('.').pop();
      const fileName = `${userDir}/${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Insert document record
      const { data, error } = await supabase
        .from('user_documents')
        .insert({
          user_id: currentUserId,
          company_id: selectedCompany.id,
          name: file.name,
          file_path: filePath,
          file_type: file.type,
          document_type: documentType,
          description: description || null,
          uploaded_by: currentUserId
        })
        .select()
        .single();

      if (error) throw error;

      const newDoc = data as UserDocument;
      setDocuments(prev => [newDoc, ...prev]);
      toast.success('Documento enviado com sucesso');
      
      return true;
    } catch (error: any) {
      console.error('Erro no upload do documento:', error);
      
      if (error.message.includes("storage/bucket-not-found")) {
        toast.error("Sistema de armazenamento não está disponível. Contate o administrador.");
      } else {
        toast.error(`Falha ao enviar documento: ${error.message}`);
      }
      
      return false;
    } finally {
      setIsUploading(false);
    }
  }, [currentUserId, selectedCompany]);

  // Função para excluir documentos
  async function handleDelete(documentId: string): Promise<boolean> {
    try {
      const { data: document, error: fetchError } = await supabase
        .from('user_documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (fetchError) throw fetchError;

      // Check if user can delete this document
      if (!canDeleteDocument(document as UserDocument)) {
        toast.error("Você não tem permissão para excluir este documento");
        return false;
      }

      // Delete document from database first
      const { error: deleteError } = await supabase
        .from('user_documents')
        .delete()
        .eq('id', documentId);

      if (deleteError) throw deleteError;

      // Try to delete the file from storage (but don't fail if it doesn't exist)
      try {
        await supabase.storage
          .from('documents')
          .remove([document.file_path]);
      } catch (storageError) {
        console.warn("Não foi possível excluir o arquivo do armazenamento:", storageError);
        // Continue anyway, since the database record is already deleted
      }

      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      toast.success("Documento excluído com sucesso");
      return true;
    } catch (error: any) {
      console.error("Erro ao excluir documento:", error);
      toast.error(`Falha ao excluir documento: ${error.message}`);
      return false;
    }
  }

  const refreshDocuments = useCallback(async () => {
    if (currentUserId && selectedCompany?.id) {
      setIsLoading(true);
      try {
        const docs = await fetchDocumentsForUser(currentUserId, selectedCompany.id);
        setDocuments(docs);
      } catch (error) {
        console.error("Erro ao atualizar documentos:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [currentUserId, selectedCompany?.id, fetchDocumentsForUser]);

  return {
    documents,
    isLoading,
    isUploading,
    uploadOpen,
    setUploadOpen,
    previewUrl,
    previewOpen,
    setPreviewOpen,
    downloadDocument: handleDownload,
    handlePreview,
    handleDelete,
    handleDocumentUpload,
    canDeleteDocument,
    refreshDocuments
  };
};
