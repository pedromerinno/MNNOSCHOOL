
import React, { useState } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { CompanyDocumentDialog } from "@/components/documents/CompanyDocumentDialog";
import { useJobRoles } from "@/hooks/job-roles/useJobRoles";
import { CompanyDocumentType } from "@/types/company-document";
import { useCompanyDocuments } from "@/hooks/company-documents/useCompanyDocuments";

interface AddDocumentDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export const AddDocumentDialog: React.FC<AddDocumentDialogProps> = ({ open, onOpenChange }) => {
  const { selectedCompany } = useCompanies();
  const { jobRoles } = useJobRoles(selectedCompany);
  const { uploadDocument } = useCompanyDocuments();
  const [isUploading, setIsUploading] = useState(false);

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
      return false;
    }

    try {
      setIsUploading(true);
      const success = await uploadDocument(
        attachmentType,
        fileOrUrl,
        documentType,
        description,
        name,
        selectedJobRoles,
        selectedUsers
      );
      return success;
    } catch (e) {
      console.error('Error uploading document:', e);
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  if (!selectedCompany) {
    return (
      <CompanyDocumentDialog
        open={open}
        onOpenChange={onOpenChange}
        onUpload={handleUpload}
        isUploading={isUploading}
        availableRoles={[]}
      />
    );
  }

  return (
    <CompanyDocumentDialog
      open={open}
      onOpenChange={onOpenChange}
      onUpload={handleUpload}
      isUploading={isUploading}
      availableRoles={jobRoles.filter(role => role.company_id === selectedCompany?.id)}
    />
  );
};
