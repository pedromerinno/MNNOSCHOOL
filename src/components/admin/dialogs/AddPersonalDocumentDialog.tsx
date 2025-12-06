import React, { useState } from "react";
import { DocumentUploadForm } from "@/components/documents/DocumentUploadForm";
import { useDocumentManagerOptimized } from "@/hooks/documents/useDocumentManagerOptimized";
import { DocumentType } from "@/types/document";

interface AddPersonalDocumentDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export const AddPersonalDocumentDialog: React.FC<AddPersonalDocumentDialogProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const { handleDocumentUpload, isUploading } = useDocumentManagerOptimized();

  const handleUpload = async (
    attachmentType: 'file' | 'link',
    fileOrUrl: File | string,
    documentType: DocumentType,
    description: string,
    name: string
  ): Promise<boolean> => {
    return await handleDocumentUpload(attachmentType, fileOrUrl, documentType, description, name);
  };

  return (
    <DocumentUploadForm
      open={open}
      onOpenChange={onOpenChange}
      onUpload={handleUpload}
      isUploading={isUploading}
    />
  );
};
