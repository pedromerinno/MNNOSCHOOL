
import { useState } from 'react';
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DocumentPreview } from "@/components/documents/DocumentPreview";
import { DocumentTabs } from "@/components/documents/DocumentTabs";
import { useDocumentManager } from "@/hooks/useDocumentManager";
import { UserDocument, DocumentType } from "@/types/document";

const Documents = () => {
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
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Documentos</h1>
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
    </DashboardLayout>
  );
};

export default Documents;
