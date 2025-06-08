
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DocumentType } from "@/types/document";
import { useState } from "react";
import { toast } from "sonner";
import { DocumentAttachmentForm } from "./DocumentAttachmentForm";

interface DocumentUploadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (
    attachmentType: 'file' | 'link',
    fileOrUrl: File | string,
    documentType: DocumentType,
    description: string,
    name: string
  ) => Promise<boolean>;
  isUploading: boolean;
}

export const DocumentUploadForm = ({
  open,
  onOpenChange,
  onUpload,
  isUploading
}: DocumentUploadFormProps) => {
  const [fileError, setFileError] = useState<string | null>(null);

  const handleSubmit = async (
    attachmentType: 'file' | 'link',
    fileOrUrl: File | string,
    documentType: DocumentType,
    description: string,
    name: string
  ) => {
    setFileError(null);
    const success = await onUpload(attachmentType, fileOrUrl, documentType, description, name);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <>
      <Card>
        <CardContent className="p-6 px-[40px] py-[40px]">
          <div 
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.classList.add('border-primary');
            }} 
            onDragLeave={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove('border-primary');
            }} 
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove('border-primary');
              const files = Array.from(e.dataTransfer.files);
              if (files.length > 0) {
                onOpenChange(true);
              }
            }} 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors py-[80px] px-[80px]"
          >
            <Upload className="h-10 w-8 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Arraste e solte seus documentos aqui
            </p>
            <p className="text-gray-500 text-sm mb-4">ou</p>
            <Button onClick={() => onOpenChange(true)}>Adicionar Documento</Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Documento</DialogTitle>
          </DialogHeader>
          
          <DocumentAttachmentForm
            onSubmit={handleSubmit}
            isUploading={isUploading}
            fileError={fileError}
            onCancel={() => onOpenChange(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
