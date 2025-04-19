
import { useState } from 'react';
import { PageLayout } from "@/components/layout/PageLayout";
import { DocumentPreview } from "@/components/documents/DocumentPreview";
import { DocumentTabs } from "@/components/documents/DocumentTabs";
import { useDocumentManager } from "@/hooks/useDocumentManager";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DocumentType } from "@/types/document";

const Documents = () => {
  const [activeTab, setActiveTab] = useState("todos");
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

  // Filtrar documentos baseado na aba selecionada
  const filteredDocuments = documents.filter(doc => {
    if (activeTab === "todos") return true;
    if (activeTab === "empresa") return doc.uploaded_by !== doc.user_id;
    if (activeTab === "meus") return doc.uploaded_by === doc.user_id;
    return true;
  });

  return (
    <PageLayout title="Documentos">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="empresa">Documentos da Empresa</TabsTrigger>
          <TabsTrigger value="meus">Meus Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="todos">
          <DocumentTabs
            documents={filteredDocuments}
            uploadOpen={false}
            setUploadOpen={setUploadOpen}
            isUploading={isUploading}
            onUpload={handleDocumentUpload}
            onDownload={downloadDocument}
            onPreview={handlePreview}
            onDelete={handleDelete}
            canDeleteDocument={canDeleteDocument}
            showUploadButton={false}
          />
        </TabsContent>

        <TabsContent value="empresa">
          <DocumentTabs
            documents={filteredDocuments}
            uploadOpen={false}
            setUploadOpen={setUploadOpen}
            isUploading={isUploading}
            onUpload={handleDocumentUpload}
            onDownload={downloadDocument}
            onPreview={handlePreview}
            onDelete={handleDelete}
            canDeleteDocument={canDeleteDocument}
            showUploadButton={false}
          />
        </TabsContent>

        <TabsContent value="meus">
          <DocumentTabs
            documents={filteredDocuments}
            uploadOpen={uploadOpen}
            setUploadOpen={setUploadOpen}
            isUploading={isUploading}
            onUpload={handleDocumentUpload}
            onDownload={downloadDocument}
            onPreview={handlePreview}
            onDelete={handleDelete}
            canDeleteDocument={canDeleteDocument}
            showUploadButton={true}
          />
        </TabsContent>
      </Tabs>

      <DocumentPreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        url={previewUrl}
      />
    </PageLayout>
  );
};

export default Documents;
