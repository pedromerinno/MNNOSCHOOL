
import React from 'react';
import { DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CompanyDocumentType } from "@/types/company-document";
import { JobRole } from "@/types/job-roles";
import { useCompanies } from "@/hooks/useCompanies";
import { CompanyDocumentDialog } from "./CompanyDocumentDialog";
import { Plus, Building } from 'lucide-react';

interface CompanyDocumentUploadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (
    attachmentType: 'file' | 'link',
    fileOrUrl: File | string,
    documentType: CompanyDocumentType,
    description: string,
    name: string,
    selectedJobRoles: string[],
    selectedUsers: string[]
  ) => Promise<boolean>;
  isUploading: boolean;
  availableRoles: JobRole[];
}

export const CompanyDocumentUploadForm: React.FC<CompanyDocumentUploadFormProps> = ({
  open,
  onOpenChange,
  onUpload,
  isUploading,
  availableRoles
}) => {
  const { selectedCompany } = useCompanies();
  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";

  return (
    <>
      <Button 
        className="mb-6"
        style={{ backgroundColor: companyColor, borderColor: companyColor }}
        onClick={() => onOpenChange(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Documento da Empresa
      </Button>
      
      <CompanyDocumentDialog
        open={open}
        onOpenChange={onOpenChange}
        onUpload={onUpload}
        isUploading={isUploading}
        availableRoles={availableRoles}
      />
    </>
  );
};
