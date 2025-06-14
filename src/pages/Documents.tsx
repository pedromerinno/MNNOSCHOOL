
import { useState } from 'react';
import { DocumentPreview } from "@/components/documents/DocumentPreview";
import { DocumentTabs } from "@/components/documents/DocumentTabs";
import { useDocumentManager } from "@/hooks/useDocumentManager";
import { UserDocument, DocumentType } from "@/types/document";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CompanyThemedBadge } from "@/components/ui/badge";
import { useCompanies } from "@/hooks/useCompanies";
import { MainNavigationMenu } from "@/components/navigation/MainNavigationMenu";
import { AdminFloatingActionButton } from "@/components/admin/AdminFloatingActionButton";

const Documents = () => {
  const { selectedCompany } = useCompanies();
  const [activeTab, setActiveTab] = useState("all");
  const {
    documents,
    isUploading,
    uploadOpen,
    setUploadOpen,
    previewUrl,
    previewOpen,
    setPreviewOpen,
    downloadDocument,
    handlePreview,
    handleDelete,
    handleDocumentUpload,
    canDeleteDocument,
    refreshDocuments
  } = useDocumentManager();

  const handleUpload = async (
    attachmentType: 'file' | 'link',
    fileOrUrl: File | string,
    documentType: DocumentType,
    description: string,
    name: string
  ) => {
    const success = await handleDocumentUpload(attachmentType, fileOrUrl, documentType, description, name);
    if (success) {
      await refreshDocuments();
    }
    return success;
  };

  const handleDocumentDelete = async (document: UserDocument) => {
    // Verifica se o usuário tem permissão para excluir antes de continuar
    if (!canDeleteDocument(document)) {
      alert("Você só pode excluir documentos que você mesmo enviou.");
      return;
    }
    
    await handleDelete(document.id);
    await refreshDocuments();
  };

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
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold dark:text-white">
                Documentos
              </h1>
              {selectedCompany && (
                <CompanyThemedBadge variant="beta">
                  {selectedCompany.nome}
                </CompanyThemedBadge>
              )}
            </div>
          </div>
          
          <div className="bg-white dark:bg-card rounded-xl shadow-sm p-6">
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                Gerencie seus documentos e arquivos
              </p>
            </div>

            <DocumentTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              documents={documents}
              uploadOpen={uploadOpen}
              setUploadOpen={setUploadOpen}
              isUploading={isUploading}
              onUpload={handleUpload}
              onDownload={downloadDocument}
              onPreview={handlePreview}
              onDelete={handleDocumentDelete}
              canDeleteDocument={canDeleteDocument}
            />

            <DocumentPreview
              open={previewOpen}
              onOpenChange={setPreviewOpen}
              url={previewUrl}
            />
          </div>
        </main>
        <AdminFloatingActionButton />
      </div>
    </>
  );
};

export default Documents;
