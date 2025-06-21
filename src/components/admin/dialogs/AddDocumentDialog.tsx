
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useCompanies } from "@/hooks/useCompanies";
import { CompanyDocumentUploadForm } from "@/components/documents/CompanyDocumentUploadForm";
import { useJobRoles } from "@/hooks/job-roles/useJobRoles";
import { CompanyDocumentType } from "@/types/company-document";

interface AddDocumentDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export const AddDocumentDialog: React.FC<AddDocumentDialogProps> = ({ open, onOpenChange }) => {
  const [isUploading, setIsUploading] = useState(false);
  const { selectedCompany } = useCompanies();
  const { jobRoles } = useJobRoles(selectedCompany);

  const handleUpload = async (
    attachmentType: 'file' | 'link',
    fileOrUrl: File | string,
    documentType: CompanyDocumentType,
    description: string,
    name: string,
    selectedJobRoles: string[],
    selectedUsers: string[]
  ): Promise<boolean> => {
    if (!selectedCompany?.id) {
      toast.error("Por favor, selecione uma empresa primeiro");
      return false;
    }

    try {
      setIsUploading(true);
      // Simulate upload/save process
      await new Promise(res => setTimeout(res, 1200));
      
      const successMessage = attachmentType === 'file' ? 
        "Documento enviado com sucesso!" : 
        "Link adicionado com sucesso!";
      
      toast.success(successMessage);
      return true;
    } catch (e) {
      const errorMessage = attachmentType === 'file' ? 
        "Falha no envio do documento." : 
        "Falha ao adicionar o link.";
      
      toast.error(errorMessage);
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  if (!selectedCompany) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Documento</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Selecione uma empresa primeiro para adicionar documentos.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <CompanyDocumentUploadForm
      open={open}
      onOpenChange={onOpenChange}
      onUpload={handleUpload}
      isUploading={isUploading}
      availableRoles={jobRoles.filter(role => role.company_id === selectedCompany?.id)}
    />
  );
};
