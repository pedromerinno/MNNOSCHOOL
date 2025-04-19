
import { useState } from 'react';
import { UserDocument, DocumentType } from "@/types/document";
import { supabase } from "@/integrations/supabase/client";
import { useUserDocumentsViewer } from "@/hooks/useUserDocumentsViewer";
import { useDocuments } from "@/hooks/useDocuments";
import { toast } from "sonner";

export const useDocumentManager = () => {
  const { 
    documents, 
    isLoading, 
    downloadDocument, 
    deleteDocument, 
    refreshDocuments 
  } = useUserDocumentsViewer();
  
  const { isUploading, handleUpload, canDeleteDocument } = useDocuments();
  
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handlePreview = async (document: UserDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.file_path, 3600);
        
      if (error) throw error;
      
      setPreviewUrl(data.signedUrl);
      setPreviewOpen(true);
    } catch (error: any) {
      console.error('Error previewing document:', error);
      toast.error(`Falha ao visualizar o documento: ${error.message}`);
    }
  };

  const handleDelete = async (document: UserDocument): Promise<void> => {
    if (window.confirm(`Tem certeza que deseja excluir o documento "${document.name}"?`)) {
      await deleteDocument(document.id);
      refreshDocuments();
    }
  };

  const handleDocumentUpload = async (
    file: File, 
    documentType: DocumentType, 
    description: string
  ): Promise<boolean> => {
    return await handleUpload(file, documentType, description);
  };

  return {
    documents,
    isLoading,
    isUploading,
    uploadOpen,
    setUploadOpen,
    previewUrl,
    previewOpen,
    setPreviewOpen,
    canDeleteDocument,
    downloadDocument,
    handlePreview,
    handleDelete,
    handleDocumentUpload
  };
};
