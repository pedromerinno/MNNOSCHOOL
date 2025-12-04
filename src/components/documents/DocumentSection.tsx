
import React, { useState, useMemo } from 'react';
import { DocumentFilter } from './DocumentFilter';
import { DocumentList } from './DocumentList';
import { CompanyDocumentList } from './CompanyDocumentList';
import { DocumentTableView } from './DocumentTableView';
import { CompanyDocumentTableView } from './CompanyDocumentTableView';
import { UnifiedDocumentDialog } from './UnifiedDocumentDialog';
import { DocumentUploadForm } from './DocumentUploadForm';
import { CompanyDocumentUploadForm } from './CompanyDocumentUploadForm';
import { useJobRoles } from '@/hooks/job-roles/useJobRoles';
import { useCompanies } from '@/hooks/useCompanies';
import { CompanyDocumentType } from '@/types/company-document';
import { DocumentType } from '@/types/document';
import { useIsAdmin } from '@/hooks/company/useIsAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, X, FileText, Files } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

interface DocumentSectionProps {
  type: 'personal' | 'company';
  documents: any[];
  isUploading: boolean;
  onUpload: any;
  onUploadCompany?: any; // Callback para upload de documento da empresa
  onUploadPersonal?: any; // Callback para upload de documento pessoal
  onDownload: any;
  onPreview: any;
  onDelete: any;
  onEdit?: any;
  onUpdate?: any;
  canDeleteDocument: any;
  companyColor: string;
  viewMode?: 'card' | 'table';
}

export const DocumentSection: React.FC<DocumentSectionProps> = ({
  type,
  documents,
  isUploading,
  onUpload,
  onUploadCompany,
  onUploadPersonal,
  onDownload,
  onPreview,
  onDelete,
  onEdit,
  onUpdate,
  canDeleteDocument,
  companyColor,
  viewMode = 'card'
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const { selectedCompany } = useCompanies();
  const { jobRoles } = useJobRoles(selectedCompany);
  const { isAdmin, isLoading } = useIsAdmin();

  // Filter documents based on selected category and search term
  const filteredDocuments = useMemo(() => {
    let filtered = documents.filter(doc => {
      if (selectedCategory === 'all') return true;
      return doc.document_type === selectedCategory;
    });

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(doc => 
        doc.name?.toLowerCase().includes(term) ||
        doc.description?.toLowerCase().includes(term) ||
        (doc.link_url && doc.link_url.toLowerCase().includes(term))
      );
    }

    return filtered;
  }, [documents, selectedCategory, searchTerm]);

  const handleAddDocument = () => {
    setIsUploadDialogOpen(true);
  };

  const sectionTitle = type === 'company' ? 'Documentos da Empresa' : 'Meus Documentos';
  const totalDocuments = documents.length;
  const filteredCount = filteredDocuments.length;
  
  const sectionDescription = type === 'company' 
    ? (selectedCategory === 'all' && !searchTerm.trim())
      ? `${totalDocuments} ${totalDocuments === 1 ? 'documento compartilhado' : 'documentos compartilhados'}`
      : `${filteredCount} ${filteredCount === 1 ? 'documento encontrado' : 'documentos encontrados'}`
    : (selectedCategory === 'all' && !searchTerm.trim())
      ? `${totalDocuments} ${totalDocuments === 1 ? 'documento pessoal' : 'documentos pessoais'}`
      : `${filteredCount} ${filteredCount === 1 ? 'documento encontrado' : 'documentos encontrados'}`;

  return (
    <div className="space-y-8">
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {sectionTitle}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {sectionDescription}
            </p>
          </div>
          {/* Mostrar botão apenas para admin na seção de documentos da empresa */}
          {!isLoading && (type === 'company' ? isAdmin : true) && (
            <Button
              onClick={handleAddDocument}
              className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white rounded-full px-6 py-2.5 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Adicionar Documento
            </Button>
          )}
        </div>
        
        {/* Campo de busca e filtro lado a lado */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por nome, descrição ou URL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 w-full"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex-shrink-0">
            <DocumentFilter
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              documentType={type}
              companyColor={companyColor}
            />
          </div>
        </div>
      </div>

      {filteredDocuments.length === 0 ? (
        <div className="py-8">
          <EmptyState 
            title="Nenhum resultado encontrado"
            description={searchTerm ? `Não foram encontrados documentos que correspondam a "${searchTerm}".` : "Nenhum documento foi cadastrado ainda."}
            icons={type === 'company' ? [Files, FileText] : [FileText]}
          />
        </div>
      ) : (

        <>
          {viewMode === 'table' ? (
            type === 'company' ? (
              <CompanyDocumentTableView
                documents={filteredDocuments}
                onDownload={onDownload}
                onPreview={onPreview}
                onDelete={onDelete}
                onEdit={onEdit}
                canDeleteDocument={canDeleteDocument}
                onAddDocument={handleAddDocument}
              />
            ) : (
              <DocumentTableView
                documents={filteredDocuments}
                onDownload={onDownload}
                onPreview={onPreview}
                onDelete={onDelete}
                onUpdate={onUpdate}
                canDeleteDocument={canDeleteDocument}
                onAddDocument={handleAddDocument}
                companyColor={companyColor}
              />
            )
          ) : (
            type === 'company' ? (
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
                onUpdate={onUpdate}
                canDeleteDocument={canDeleteDocument}
                onAddDocument={handleAddDocument}
                companyColor={companyColor}
              />
            )
          )}
        </>
      )}

      {/* Para documentos da empresa, sempre usar CompanyDocumentUploadForm diretamente */}
      {type === 'company' ? (
        <CompanyDocumentUploadForm
          open={isUploadDialogOpen}
          onOpenChange={setIsUploadDialogOpen}
          onUpload={onUpload}
          isUploading={isUploading}
          availableRoles={jobRoles}
        />
      ) : onUploadCompany && onUploadPersonal ? (
        <UnifiedDocumentDialog
          open={isUploadDialogOpen}
          onOpenChange={setIsUploadDialogOpen}
          onUploadCompany={onUploadCompany}
          onUploadPersonal={onUploadPersonal}
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
