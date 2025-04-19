
import { useState } from 'react';
import { UserDocument } from "@/types/document";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useUserDocumentsList = (onDelete: (documentId: string) => Promise<boolean>) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const handleDownload = async (document: UserDocument) => {
    setDownloadingId(document.id);
    setError(null);
    
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path);
        
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.name;
      a.click();
      URL.revokeObjectURL(url);
      
    } catch (error: any) {
      console.error('Error downloading document:', error);
      
      let errorMessage = 'Falha ao baixar o documento';
      
      if (error.message.includes("storage/object-not-found")) {
        errorMessage = "Arquivo não encontrado. Pode ter sido excluído.";
      } else {
        errorMessage = `Falha ao baixar o documento: ${error.message}`;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setDownloadingId(null);
    }
  };

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

  const confirmDelete = async (document: UserDocument) => {
    if (document.uploaded_by !== currentUserId) {
      toast.error("Você só pode excluir documentos que você mesmo enviou.");
      return;
    }

    if (window.confirm(`Tem certeza que deseja excluir o documento "${document.name}"?`)) {
      setDeletingId(document.id);
      setError(null);
      try {
        await onDelete(document.id);
      } catch (error: any) {
        setError(`Falha ao excluir o documento: ${error.message}`);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return {
    downloadingId,
    deletingId,
    error,
    previewUrl,
    previewOpen,
    setPreviewOpen,
    currentUserId,
    setCurrentUserId,
    handleDownload,
    handlePreview,
    confirmDelete,
  };
};
