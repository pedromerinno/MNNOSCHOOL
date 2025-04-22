
import { useUserDocumentsViewer } from "@/hooks/useUserDocumentsViewer";
import { useDocumentPreview } from "@/hooks/documents/useDocumentPreview";
import { useDocumentDeletion } from "@/hooks/documents/useDocumentDeletion";
import { useDocumentUpload } from "@/hooks/documents/useDocumentUpload";

export const useDocumentManager = () => {
  const { documents, isLoading, downloadDocument, refreshDocuments } = useUserDocumentsViewer();
  const { previewUrl, previewOpen, setPreviewOpen, handlePreview } = useDocumentPreview();
  const { handleDelete } = useDocumentDeletion();
  const { 
    isUploading, 
    uploadOpen, 
    setUploadOpen, 
    canDeleteDocument, 
    handleDocumentUpload,
    fileError,
    setFileError
  } = useDocumentUpload();

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
    handleDocumentUpload,
    refreshDocuments,
    fileError,
    setFileError
  };
};
