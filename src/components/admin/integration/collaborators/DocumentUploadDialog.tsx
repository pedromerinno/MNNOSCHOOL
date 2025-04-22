
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DocumentType } from "@/types/document";
import { DocumentUploadForm } from './DocumentUploadForm';
import { useDocumentUpload } from '@/hooks/useDocumentUpload';

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  companyId: string;
  onUploadComplete: () => void;
}

export const DocumentUploadDialog: React.FC<DocumentUploadDialogProps> = ({
  open,
  onOpenChange,
  userId,
  companyId,
  onUploadComplete
}) => {
  console.log("DocumentUploadDialog rendering with:", { userId, companyId });
  
  // Pass the parameters as an object to match the hook signature
  const { isUploading, fileError, uploadDocument } = useDocumentUpload({
    userId,
    companyId,
    onUploadComplete
  });

  const handleSubmit = async (file: File, documentType: DocumentType, description: string) => {
    console.log("Attempting to upload document for user:", userId, "in company:", companyId);
    const success = await uploadDocument(file, documentType, description);
    if (success) {
      console.log("Document upload successful");
      onOpenChange(false);
    } else {
      console.error("Document upload failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload de Documento</DialogTitle>
          <DialogDescription>
            Faça upload de um documento para o colaborador
          </DialogDescription>
        </DialogHeader>
        
        <DocumentUploadForm
          onSubmit={handleSubmit}
          isUploading={isUploading}
          fileError={fileError}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
