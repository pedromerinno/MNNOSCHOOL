
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
  // Pass the parameters as an object to match the new hook signature
  const { isUploading, fileError, uploadDocument } = useDocumentUpload({
    userId,
    companyId,
    onUploadComplete
  });

  const handleSubmit = async (file: File, documentType: DocumentType, description: string) => {
    const success = await uploadDocument(file, documentType, description);
    if (success) {
      onOpenChange(false);
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
