
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DocumentType } from "@/types/document";
import { DocumentUploadForm } from './DocumentUploadForm';
import { useDocumentUpload } from '@/hooks/useDocumentUpload';
import { supabase } from "@/integrations/supabase/client";

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
  
  const { isUploading, fileError, uploadDocument } = useDocumentUpload({
    userId,
    companyId,
    onUploadComplete
  });

  const uploadDocumentLink = async (
    linkUrl: string,
    name: string,
    documentType: DocumentType,
    description: string
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const { error } = await supabase
        .from('user_documents')
        .insert({
          user_id: userId,
          company_id: companyId,
          name: name,
          link_url: linkUrl,
          attachment_type: 'link',
          document_type: documentType,
          description: description || null,
          uploaded_by: user.id
        });

      if (error) throw error;
      
      onUploadComplete();
      return true;
    } catch (error: any) {
      console.error('Erro ao adicionar link do documento:', error);
      return false;
    }
  };

  const handleSubmit = async (
    attachmentType: 'file' | 'link',
    fileOrUrl: File | string,
    documentType: DocumentType,
    description: string,
    name: string
  ) => {
    console.log("Attempting to upload document for user:", userId, "in company:", companyId);
    
    if (attachmentType === 'file' && fileOrUrl instanceof File) {
      const success = await uploadDocument(fileOrUrl, documentType, description);
      if (success) {
        console.log("Document upload successful");
        onOpenChange(false);
      } else {
        console.error("Document upload failed");
      }
    } else if (attachmentType === 'link' && typeof fileOrUrl === 'string') {
      const success = await uploadDocumentLink(fileOrUrl, name, documentType, description);
      if (success) {
        console.log("Document link added successfully");
        onOpenChange(false);
      } else {
        console.error("Document link failed");
      }
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
