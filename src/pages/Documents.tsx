import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { DocumentSection } from "@/components/documents/DocumentSection";
import { EditCompanyDocumentDialog } from "@/components/documents/EditCompanyDocumentDialog";
import { DocumentsDescription } from "@/components/documents/DocumentsDescription";
import { DocumentStatsCards } from "@/components/documents/DocumentStatsCards";
import { IntegrationStylePage, IntegrationSection } from "@/components/integration/layout/IntegrationStylePage";
import { InteractiveCard } from "@/components/integration/InteractiveCard";
import { EmptyState } from "@/components/ui/empty-state";
import { Preloader } from "@/components/ui/Preloader";
import { useDocumentManagerOptimized } from "@/hooks/documents/useDocumentManagerOptimized";
import { useCompanyDocuments } from "@/hooks/company-documents/useCompanyDocuments";
import { CompanyDocument } from "@/types/company-document";
import { FileText, Building, LayoutGrid, Table as TableIcon, ArrowLeft } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CompanyThemedBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Documents = () => {
  const navigate = useNavigate();
  const { user, userProfile, loading: authLoading } = useAuth();
  const { selectedCompany, isLoading: companiesLoading } = useCompanies();
  const [editingDocument, setEditingDocument] = useState<CompanyDocument | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  // Hooks para documentos pessoais
  const {
    documents: personalDocuments,
    isLoading: personalLoading,
    isUploading: personalUploading,
    handleDocumentUpload: uploadPersonalDocument,
    downloadDocument: downloadPersonalDocument,
    handlePreview: previewPersonalDocument,
    handleDelete: deletePersonalDocument,
    updateDocument: updatePersonalDocument,
    canDeleteDocument: canDeletePersonalDocument
  } = useDocumentManagerOptimized();

  // Hooks para documentos da empresa
  const {
    documents: companyDocuments,
    isLoading: companyLoading,
    uploadDocument: uploadCompanyDocument,
    updateDocument: updateCompanyDocument,
    downloadDocument: downloadCompanyDocument,
    previewDocument: previewCompanyDocument,
    deleteDocument: deleteCompanyDocument,
    canDeleteDocument: canDeleteCompanyDocument
  } = useCompanyDocuments();

  // Wrapper function to handle personal document deletion
  const handlePersonalDocumentDelete = async (document: any) => {
    await deletePersonalDocument(document.id);
  };

  // Wrapper function to handle company document deletion
  const handleCompanyDocumentDelete = async (document: any) => {
    await deleteCompanyDocument(document);
  };

  // Handle company document editing
  const handleEditDocument = (document: CompanyDocument) => {
    setEditingDocument(document);
    setIsEditDialogOpen(true);
  };

  const handleUpdateDocument = async (
    documentId: string,
    name: string,
    description: string,
    documentType: any,
    selectedJobRoles: string[],
    selectedUsers: string[],
    thumbnailPath?: string | null
  ): Promise<boolean> => {
    return await updateCompanyDocument(
      documentId,
      name,
      description,
      documentType,
      selectedJobRoles,
      selectedUsers,
      thumbnailPath
    );
  };

  // Seções para a sidebar
  const sections = [
    { id: 'company', label: 'Documentos da Empresa', icon: Building },
    { id: 'personal', label: 'Meus Documentos', icon: FileText },
  ];

  // Mostrar preloader apenas durante carregamento crítico (auth e empresa)
  // Não bloquear por queries de documentos que podem ser carregados progressivamente
  if (authLoading || !user || !userProfile || companiesLoading) {
    return <Preloader />;
  }

  if (!user) {
    return <Preloader />;
  }

  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";

  // Caso: Sem empresa selecionada
  if (!selectedCompany) {
    return (
      <IntegrationStylePage
        title="Documentos"
        sections={[]}
        showSidebar={false}
        backPath="/"
      >
        <IntegrationSection
          id="empty"
          withCard={true}
          delay={0.1}
        >
          <EmptyState 
            title="Selecione uma empresa"
            description="Selecione uma empresa no menu superior para visualizar os documentos cadastrados."
            icons={[FileText]}
          />
        </IntegrationSection>
      </IntegrationStylePage>
    );
  }

  // Hero section com descrição e estatísticas
  const heroSection = (
    <>
      <InteractiveCard 
        companyColor={companyColor}
        hoverEffect={false}
        borderBeam={false}
        className="p-6 lg:p-8 mb-6"
      >
        <DocumentsDescription companyName={selectedCompany.nome} />
      </InteractiveCard>
      <DocumentStatsCards
        companyCount={companyDocuments.length}
        personalCount={personalDocuments.length}
        companyColor={companyColor}
        isLoadingCompany={companyLoading}
        isLoadingPersonal={personalLoading}
      />
    </>
  );

  // Caso: Com empresa - Página completa
  return (
    <>
      <IntegrationStylePage
        title="Documentos"
        sections={sections}
        backPath="/"
        showSidebar={true}
        showCompanyBadge={true}
        customHeader={
          <>
            <div className="flex items-center justify-between w-full mb-8 lg:mb-12">
              <div className="flex items-center gap-3 lg:gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-0 hover:bg-transparent" 
                  onClick={() => navigate('/')}
                >
                  <ArrowLeft className="h-4 w-5 lg:h-5 lg:w-5 text-gray-500 dark:text-gray-400" />
                </Button>
                <h1 className="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white tracking-tight">
                  Documentos
                </h1>
                {selectedCompany && (
                  <CompanyThemedBadge variant="beta">
                    {selectedCompany.nome}
                  </CompanyThemedBadge>
                )}
              </div>
              <ToggleGroup 
                type="single" 
                value={viewMode} 
                onValueChange={(value) => value && setViewMode(value as 'card' | 'table')}
                className="border border-gray-200 dark:border-gray-800 rounded-lg p-1"
              >
                <ToggleGroupItem 
                  value="card" 
                  aria-label="Visualização em cards"
                  className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Cards
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="table" 
                  aria-label="Visualização em tabela"
                  className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  <TableIcon className="h-4 w-4 mr-2" />
                  Tabela
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            {heroSection}
          </>
        }
        heroSection={heroSection}
      >
        {/* Seção: Documentos da Empresa */}
        <IntegrationSection
          id="company"
          companyColor={companyColor}
          direction="up"
          delay={0.1}
          withCard={true}
          cardBorderBeam={false}
        >
          {companyLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <DocumentSection 
              type="company" 
              documents={companyDocuments} 
              isUploading={false} 
              onUpload={uploadCompanyDocument}
              onUploadCompany={uploadCompanyDocument}
              onUploadPersonal={uploadPersonalDocument}
              onDownload={downloadCompanyDocument} 
              onPreview={previewCompanyDocument} 
              onDelete={handleCompanyDocumentDelete} 
              onEdit={handleEditDocument}
              canDeleteDocument={canDeleteCompanyDocument} 
              companyColor={companyColor}
              viewMode={viewMode}
            />
          )}
        </IntegrationSection>

        {/* Seção: Meus Documentos */}
        <IntegrationSection
          id="personal"
          companyColor={companyColor}
          direction="up"
          delay={0.15}
          withCard={true}
          cardBorderBeam={false}
        >
          <DocumentSection 
            type="personal" 
            documents={personalDocuments} 
            isUploading={personalUploading} 
            onUpload={uploadPersonalDocument}
            onUploadCompany={uploadCompanyDocument}
            onUploadPersonal={uploadPersonalDocument}
            onDownload={downloadPersonalDocument} 
            onPreview={previewPersonalDocument} 
            onDelete={handlePersonalDocumentDelete}
            onUpdate={updatePersonalDocument}
            canDeleteDocument={canDeletePersonalDocument} 
            companyColor={companyColor}
            viewMode={viewMode}
          />
        </IntegrationSection>
      </IntegrationStylePage>

      <EditCompanyDocumentDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        document={editingDocument}
        onUpdate={handleUpdateDocument}
        isUpdating={false}
      />
    </>
  );
};

export default Documents;
