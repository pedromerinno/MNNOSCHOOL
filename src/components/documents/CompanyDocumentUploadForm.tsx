
import React from 'react';
import { CompanyDocumentType } from "@/types/company-document";
import { JobRole } from "@/types/job-roles";
import { CompanyDocumentDialog } from "./CompanyDocumentDialog";

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
  return (
    <CompanyDocumentDialog
      open={open}
      onOpenChange={onOpenChange}
      onUpload={onUpload}
      isUploading={isUploading}
      availableRoles={availableRoles}
    />
  );
};
