
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { MainNavigationMenu } from "@/components/navigation/MainNavigationMenu";
import { AdminFloatingActionButton } from "@/components/admin/AdminFloatingActionButton";
import { PagePreloader } from "@/components/ui/PagePreloader";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Building } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { CompanyThemedBadge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentSection } from "@/components/documents/DocumentSection";
import { useDocumentManagerOptimized } from "@/hooks/documents/useDocumentManagerOptimized";
import { useCompanyDocuments } from "@/hooks/company-documents/useCompanyDocuments";

const Documents = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { selectedCompany, isLoading: companiesLoading } = useCompanies();
  
  const [mainTab, setMainTab] = useState<'company' | 'personal'>('company');

  // Hooks para documentos pessoais
  const {
    documents: personalDocuments,
    isLoading: personalLoading,
    isUploading: personalUploading,
    handleDocumentUpload: uploadPersonalDocument,
    downloadDocument: downloadPersonalDocument,
    handlePreview: previewPersonalDocument,
    handleDelete: deletePersonalDocument,
    canDeleteDocument: canDeletePersonalDocument
  } = useDocumentManagerOptimized();

  // Hooks para documentos da empresa
  const {
    documents: companyDocuments,
    isLoading: companyLoading,
    uploadDocument: uploadCompanyDocument,
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

  if (!userProfile) {
    return <Navigate to="/login" replace />;
  }

  if (companiesLoading || personalLoading) {
    return <PagePreloader />;
  }

  if (!selectedCompany) {
    return (
      <>
        <MainNavigationMenu />
        <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#191919]">
          <main className="container mx-auto px-6 py-12">
            <div className="flex items-center mb-12 gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-0 hover:bg-transparent" 
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-5 w-5 text-gray-500" />
              </Button>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold dark:text-white">
                  Documentos
                </h1>
              </div>
            </div>
            
            <div className="bg-white dark:bg-card rounded-xl shadow-sm p-6">
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Selecione uma empresa</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Selecione uma empresa no menu superior para visualizar os documentos.
                </p>
              </div>
            </div>
          </main>
          <AdminFloatingActionButton />
        </div>
      </>
    );
  }

  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";

  return (
    <>
      <MainNavigationMenu />
      <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#191919]">
        <main className="container mx-auto px-6 py-12">
          <div className="flex items-center mb-12 gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-0 hover:bg-transparent" 
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold dark:text-white">
                Documentos
              </h1>
              <CompanyThemedBadge variant="beta">
                {selectedCompany.nome}
              </CompanyThemedBadge>
            </div>
          </div>
          
          <div className="bg-white dark:bg-card rounded-xl shadow-sm p-6">
            <Tabs value={mainTab} onValueChange={(value) => setMainTab(value as 'company' | 'personal')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 rounded-2xl p-1.5">
                <TabsTrigger 
                  value="company" 
                  className="flex items-center gap-2 rounded-xl py-4"
                  style={{
                    backgroundColor: mainTab === 'company' ? `${companyColor}10` : undefined,
                    color: mainTab === 'company' ? companyColor : undefined
                  }}
                >
                  <Building className="h-4 w-4" />
                  Documentos da Empresa
                </TabsTrigger>
                <TabsTrigger 
                  value="personal" 
                  className="flex items-center gap-2 rounded-xl py-4"
                  style={{
                    backgroundColor: mainTab === 'personal' ? `${companyColor}10` : undefined,
                    color: mainTab === 'personal' ? companyColor : undefined
                  }}
                >
                  <FileText className="h-4 w-4" />
                  Meus Documentos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="company">
                {companyLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin h-8 w-8 border-t-2 border-blue-500 border-r-2 rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-500">Carregando documentos da empresa...</p>
                  </div>
                ) : (
                  <DocumentSection
                    type="company"
                    documents={companyDocuments}
                    isUploading={false}
                    onUpload={uploadCompanyDocument}
                    onDownload={downloadCompanyDocument}
                    onPreview={previewCompanyDocument}
                    onDelete={handleCompanyDocumentDelete}
                    canDeleteDocument={canDeleteCompanyDocument}
                    companyColor={companyColor}
                  />
                )}
              </TabsContent>

              <TabsContent value="personal">
                <DocumentSection
                  type="personal"
                  documents={personalDocuments}
                  isUploading={personalUploading}
                  onUpload={uploadPersonalDocument}
                  onDownload={downloadPersonalDocument}
                  onPreview={previewPersonalDocument}
                  onDelete={handlePersonalDocumentDelete}
                  canDeleteDocument={canDeletePersonalDocument}
                  companyColor={companyColor}
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
        <AdminFloatingActionButton />
      </div>
    </>
  );
};

export default Documents;
