
import { useState } from 'react';
import { DocumentType } from "@/types/document";
import { useDocuments } from "@/hooks/useDocuments";

export const useDocumentUpload = () => {
  const { isUploading, handleUpload, canDeleteDocument } = useDocuments();
  const [uploadOpen, setUploadOpen] = useState(false);

  const handleDocumentUpload = async (
    file: File, 
    documentType: DocumentType, 
    description: string
  ): Promise<boolean> => {
    return await handleUpload(file, documentType, description);
  };

  return {
    isUploading,
    uploadOpen,
    setUploadOpen,
    canDeleteDocument,
    handleDocumentUpload
  };
};
