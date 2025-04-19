
import { useState } from 'react';
import { PageLayout } from "@/components/layout/PageLayout";
import { DocumentPreview } from "@/components/documents/DocumentPreview";
import { DocumentTabs } from "@/components/documents/DocumentTabs";
import { useDocumentManager } from "@/hooks/useDocumentManager";

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
    canDeleteDocument
  } = useDocumentManager();

  return (
    <PageLayout title="Documentos">
      <DocumentTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        documents={documents}
        uploadOpen={uploadOpen}
        setUploadOpen={setUploadOpen}
        isUploading={isUploading}
        onUpload={handleDocumentUpload}
        onDownload={downloadDocument}
        onPreview={handlePreview}
        onDelete={handleDelete}
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
