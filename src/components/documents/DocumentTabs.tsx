
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentUploadForm } from "./DocumentUploadForm";
import { DocumentList } from "./DocumentList";
import { UserDocument, DocumentType } from "@/types/document";

interface DocumentTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  documents: UserDocument[];
  uploadOpen: boolean;
  setUploadOpen: (open: boolean) => void;
  isUploading: boolean;
  onUpload: (
    attachmentType: 'file' | 'link',
    fileOrUrl: File | string,
    documentType: DocumentType,
    description: string,
    name: string
  ) => Promise<boolean>;
  onDownload: (document: UserDocument) => Promise<void>;
  onPreview: (document: UserDocument) => Promise<void>;
  onDelete: (document: UserDocument) => Promise<void>;
  canDeleteDocument: (document: UserDocument) => boolean;
}

export const DocumentTabs = ({
  activeTab,
  setActiveTab,
  documents,
  uploadOpen,
  setUploadOpen,
  isUploading,
  onUpload,
  onDownload,
  onPreview,
  onDelete,
  canDeleteDocument
}: DocumentTabsProps) => {
  const filterDocuments = (type?: string) => {
    if (!type || type === "all") return documents;
    return documents.filter(doc => doc.document_type === type);
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-6">
        <TabsTrigger value="all">Todos</TabsTrigger>
        <TabsTrigger value="confidentiality_agreement">Confidencialidade</TabsTrigger>
        <TabsTrigger value="company_policy">Políticas</TabsTrigger>
        <TabsTrigger value="employment_contract">Contratos</TabsTrigger>
        <TabsTrigger value="other">Outros</TabsTrigger>
      </TabsList>

      <TabsContent value="all">
        <DocumentUploadForm
          open={uploadOpen}
          onOpenChange={setUploadOpen}
          onUpload={onUpload}
          isUploading={isUploading}
        />
        <div className="mt-6">
          <DocumentList
            documents={filterDocuments()}
            onDownload={onDownload}
            onPreview={onPreview}
            onDelete={onDelete}
            canDeleteDocument={canDeleteDocument}
          />
        </div>
      </TabsContent>

      <TabsContent value="confidentiality_agreement">
        <DocumentUploadForm
          open={uploadOpen}
          onOpenChange={setUploadOpen}
          onUpload={onUpload}
          isUploading={isUploading}
        />
        <div className="mt-6">
          <DocumentList
            documents={filterDocuments("confidentiality_agreement")}
            onDownload={onDownload}
            onPreview={onPreview}
            onDelete={onDelete}
            canDeleteDocument={canDeleteDocument}
          />
        </div>
      </TabsContent>

      <TabsContent value="company_policy">
        <DocumentUploadForm
          open={uploadOpen}
          onOpenChange={setUploadOpen}
          onUpload={onUpload}
          isUploading={isUploading}
        />
        <div className="mt-6">
          <DocumentList
            documents={filterDocuments("company_policy")}
            onDownload={onDownload}
            onPreview={onPreview}
            onDelete={onDelete}
            canDeleteDocument={canDeleteDocument}
          />
        </div>
      </TabsContent>

      <TabsContent value="employment_contract">
        <DocumentUploadForm
          open={uploadOpen}
          onOpenChange={setUploadOpen}
          onUpload={onUpload}
          isUploading={isUploading}
        />
        <div className="mt-6">
          <DocumentList
            documents={filterDocuments("employment_contract")}
            onDownload={onDownload}
            onPreview={onPreview}
            onDelete={onDelete}
            canDeleteDocument={canDeleteDocument}
          />
        </div>
      </TabsContent>

      <TabsContent value="other">
        <DocumentUploadForm
          open={uploadOpen}
          onOpenChange={setUploadOpen}
          onUpload={onUpload}
          isUploading={isUploading}
        />
        <div className="mt-6">
          <DocumentList
            documents={filterDocuments("other")}
            onDownload={onDownload}
            onPreview={onPreview}
            onDelete={onDelete}
            canDeleteDocument={canDeleteDocument}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
};
