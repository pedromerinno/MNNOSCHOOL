
import React, { useState } from 'react';
import { DocumentUploadForm } from "./DocumentUploadForm";
import { CompanyDocumentUploadForm } from "./CompanyDocumentUploadForm";
import { DocumentList } from "./DocumentList";
import { CompanyDocumentList } from "./CompanyDocumentList";
import { DocumentFilter } from "./DocumentFilter";
import { UserDocument, DocumentType } from "@/types/document";
import { CompanyDocument, CompanyDocumentType } from "@/types/company-document";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { useJobRoles } from "@/hooks/job-roles/useJobRoles";

interface DocumentSectionProps {
  type: 'personal' | 'company';
  documents: UserDocument[] | CompanyDocument[];
  isUploading: boolean;
  onUpload: any;
  onDownload: any;
  onPreview: any;
  onDelete: any;
  canDeleteDocument: any;
  companyColor: string;
}

export const DocumentSection: React.FC<DocumentSectionProps> = ({
  type,
  documents,
  isUploading,
  onUpload,
  onDownload,
  onPreview,
  onDelete,
  canDeleteDocument,
  companyColor
}) => {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { userProfile } = useAuth();
  const { selectedCompany } = useCompanies();
  const { jobRoles } = useJobRoles();

  const filterDocuments = (docs: any[], category: string) => {
    if (category === 'all') return docs;
    return docs.filter(doc => doc.document_type === category);
  };

  const filteredDocuments = filterDocuments(documents as any[], selectedCategory);
  const canUpload = type === 'personal' || userProfile?.is_admin || userProfile?.super_admin;

  return (
    <div className="space-y-6">
      <DocumentFilter
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        documentType={type}
        companyColor={companyColor}
      />

      {canUpload && (
        <>
          {type === 'personal' ? (
            <DocumentUploadForm
              open={uploadOpen}
              onOpenChange={setUploadOpen}
              onUpload={onUpload}
              isUploading={isUploading}
            />
          ) : (
            <CompanyDocumentUploadForm
              open={uploadOpen}
              onOpenChange={setUploadOpen}
              onUpload={onUpload}
              isUploading={isUploading}
              availableRoles={jobRoles.filter(role => role.company_id === selectedCompany?.id)}
            />
          )}
        </>
      )}

      <div className="mt-6">
        {type === 'personal' ? (
          <DocumentList
            documents={filteredDocuments as UserDocument[]}
            onDownload={onDownload}
            onPreview={onPreview}
            onDelete={onDelete}
            canDeleteDocument={canDeleteDocument}
          />
        ) : (
          <CompanyDocumentList
            documents={filteredDocuments as CompanyDocument[]}
            onDownload={onDownload}
            onPreview={onPreview}
            onDelete={onDelete}
            canDeleteDocument={canDeleteDocument}
          />
        )}
      </div>
    </div>
  );
};
