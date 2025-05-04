
import { useState } from 'react';
import { PageLayout } from "@/components/layout/PageLayout";
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

  const handleUpload = async (file: File, documentType: DocumentType, description: string) => {
    const success = await handleDocumentUpload(file, documentType, description);
    if (success) {
      await refreshDocuments();
    }
    return success;
  };

  const handleDocumentDelete = async (document: UserDocument) => {
    await handleDelete(document.id);
    await refreshDocuments();
  };

  return (
    <PageLayout title="Documentos">
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
    </PageLayout>
  );
};

export default Documents;
