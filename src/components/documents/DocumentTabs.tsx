
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { File, FolderOpen, Files } from "lucide-react";
import { DocumentUploadForm } from "@/components/documents/DocumentUploadForm";
import { DocumentList } from "@/components/documents/DocumentList";
import { useCompanies } from "@/hooks/useCompanies";
import { UserDocument, DocumentType } from "@/types/document";

interface DocumentTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  documents: UserDocument[];
  uploadOpen: boolean;
  setUploadOpen: (open: boolean) => void;
  isUploading: boolean;
  onUpload: (file: File, documentType: DocumentType, description: string) => Promise<boolean>;
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
  const { selectedCompany } = useCompanies();

  const getFilteredDocuments = (tab: string) => {
    switch (tab) {
      case "company":
        // Filter to show only company uploaded documents (where user_id is not the uploader)
        return documents.filter(doc => doc.uploaded_by !== doc.user_id);
      case "personal":
        // Filter to show only personally uploaded documents
        return documents.filter(doc => doc.uploaded_by === doc.user_id);
      default:
        // "all" tab - show all documents
        return documents;
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-3 w-full rounded-2xl p-1.5 bg-transparent dark:bg-transparent gap-2">
        <TabsTrigger 
          value="all" 
          className="flex items-center gap-2 rounded-xl py-4 px-6 transition-colors"
          style={{
            backgroundColor: activeTab === "all" ? `${selectedCompany?.cor_principal}10` : undefined,
            borderColor: activeTab === "all" ? selectedCompany?.cor_principal : undefined,
            color: activeTab === "all" ? selectedCompany?.cor_principal : undefined
          }}
        >
          <Files className="h-4 w-4" />
          Todos
        </TabsTrigger>
        <TabsTrigger 
          value="company" 
          className="flex items-center gap-2 rounded-xl py-4 px-6 transition-colors"
          style={{
            backgroundColor: activeTab === "company" ? `${selectedCompany?.cor_principal}10` : undefined,
            borderColor: activeTab === "company" ? selectedCompany?.cor_principal : undefined,
            color: activeTab === "company" ? selectedCompany?.cor_principal : undefined
          }}
        >
          <FolderOpen className="h-4 w-4" />
          Documentos da Empresa
        </TabsTrigger>
        <TabsTrigger 
          value="personal" 
          className="flex items-center gap-2 rounded-xl py-4 px-6 transition-colors"
          style={{
            backgroundColor: activeTab === "personal" ? `${selectedCompany?.cor_principal}10` : undefined,
            borderColor: activeTab === "personal" ? selectedCompany?.cor_principal : undefined,
            color: activeTab === "personal" ? selectedCompany?.cor_principal : undefined
          }}
        >
          <File className="h-4 w-4" />
          Meus Documentos
        </TabsTrigger>
      </TabsList>
      
      <div className="mt-10 mb-16 space-y-8">
        {["all", "company", "personal"].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue} className="m-0">
            {/* Only show upload form in personal documents tab */}
            {tabValue === "personal" && (
              <DocumentUploadForm
                open={uploadOpen}
                onOpenChange={setUploadOpen}
                onUpload={onUpload}
                isUploading={isUploading}
              />
            )}
            
            <DocumentList
              documents={getFilteredDocuments(tabValue)}
              onDownload={onDownload}
              onPreview={onPreview}
              onDelete={onDelete}
              canDeleteDocument={canDeleteDocument}
            />
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
};
