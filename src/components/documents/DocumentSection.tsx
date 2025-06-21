
import React, { useState } from 'react';
import { DocumentFilter } from './DocumentFilter';
import { DocumentList } from './DocumentList';
import { CompanyDocumentList } from './CompanyDocumentList';
import { DocumentUploadForm } from './DocumentUploadForm';
import { CompanyDocumentUploadForm } from './CompanyDocumentUploadForm';
import { useJobRoles } from '@/hooks/job-roles/useJobRoles';
import { useCompanies } from '@/hooks/useCompanies';

interface DocumentSectionProps {
  type: 'personal' | 'company';
  documents: any[];
  isUploading: boolean;
  onUpload: any;
  onDownload: any;
  onPreview: any;
  onDelete: any;
  onEdit?: any;
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
  onEdit,
  canDeleteDocument,
  companyColor
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const { selectedCompany } = useCompanies();
  const { jobRoles } = useJobRoles(selectedCompany);

  // Filter documents based on selected category
  const filteredDocuments = documents.filter(doc => {
    if (selectedCategory === 'all') return true;
    return doc.document_type === selectedCategory;
  });

  const handleAddDocument = () => {
    setIsUploadDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <DocumentFilter
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        documentType={type}
        companyColor={companyColor}
      />

      {type === 'company' ? (
        <CompanyDocumentList
          documents={filteredDocuments}
          onDownload={onDownload}
          onPreview={onPreview}
          onDelete={onDelete}
          onEdit={onEdit}
          canDeleteDocument={canDeleteDocument}
          onAddDocument={handleAddDocument}
        />
      ) : (
        <DocumentList
          documents={filteredDocuments}
          onDownload={onDownload}
          onPreview={onPreview}
          onDelete={onDelete}
          canDeleteDocument={canDeleteDocument}
          onAddDocument={handleAddDocument}
          companyColor={companyColor}
        />
      )}

      {type === 'company' ? (
        <CompanyDocumentUploadForm
          open={isUploadDialogOpen}
          onOpenChange={setIsUploadDialogOpen}
          onUpload={onUpload}
          isUploading={isUploading}
          availableRoles={jobRoles}
        />
      ) : (
        <DocumentUploadForm
          open={isUploadDialogOpen}
          onOpenChange={setIsUploadDialogOpen}
          onUpload={onUpload}
          isUploading={isUploading}
        />
      )}
    </div>
  );
};
