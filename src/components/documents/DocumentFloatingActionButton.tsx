
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { CompanyDocumentUploadForm } from "./CompanyDocumentUploadForm";
import { useCompanies } from "@/hooks/useCompanies";
import { useJobRoles } from "@/hooks/job-roles/useJobRoles";
import { useCompanyDocuments } from "@/hooks/company-documents/useCompanyDocuments";

export const DocumentFloatingActionButton: React.FC = () => {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const { selectedCompany } = useCompanies();
  const { jobRoles } = useJobRoles(selectedCompany);
  const { uploadDocument } = useCompanyDocuments();

  if (!selectedCompany) return null;

  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";

  return (
    <>
      <Button
        onClick={() => setShowUploadDialog(true)}
        className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all duration-200 z-50"
        style={{ backgroundColor: companyColor, borderColor: companyColor }}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <CompanyDocumentUploadForm
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        onUpload={uploadDocument}
        isUploading={false}
        availableRoles={jobRoles.filter(role => role.company_id === selectedCompany?.id)}
      />
    </>
  );
};
