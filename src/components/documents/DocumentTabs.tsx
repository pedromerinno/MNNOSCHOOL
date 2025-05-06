import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { File, FolderOpen, Files, FileText } from "lucide-react";
import { DocumentUploadForm } from "@/components/documents/DocumentUploadForm";
import { DocumentList } from "@/components/documents/DocumentList";
import { Button } from "@/components/ui/button";
import { useCompanies } from "@/hooks/useCompanies";
import { UserDocument, DocumentType } from "@/types/document";

// Updated EmptyDocumentsState without the upload button
const EmptyDocumentsState = () => {
  return <div className="flex flex-col items-center justify-center text-center space-y-6 py-[104px]">
      <FileText className="h-8 w-8 text-gray-400" />
      <div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Nenhum documento cadastrado
        </h3>
        <p className="mb-6 text-zinc-400">
          Aqui aparecerão documentos importantes quando eles estiverem prontos.
        </p>
      </div>
    </div>;
};
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
  const {
    selectedCompany
  } = useCompanies();
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

  // Check if there are any documents across all tabs
  const hasDocuments = documents.length > 0;
  return <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-3 w-full rounded-2xl p-1.5 bg-transparent dark:bg-transparent gap-2">
        <TabsTrigger value="all" className="flex items-center gap-2 rounded-xl py-4 px-6 transition-colors" style={{
        backgroundColor: activeTab === "all" ? `${selectedCompany?.cor_principal}10` : undefined,
        borderColor: activeTab === "all" ? selectedCompany?.cor_principal : undefined,
        color: activeTab === "all" ? selectedCompany?.cor_principal : undefined
      }}>
          <Files className="h-4 w-4" />
          Todos
        </TabsTrigger>
        <TabsTrigger value="company" className="flex items-center gap-2 rounded-xl py-4 px-6 transition-colors" style={{
        backgroundColor: activeTab === "company" ? `${selectedCompany?.cor_principal}10` : undefined,
        borderColor: activeTab === "company" ? selectedCompany?.cor_principal : undefined,
        color: activeTab === "company" ? selectedCompany?.cor_principal : undefined
      }}>
          <FolderOpen className="h-4 w-4" />
          Documentos da Empresa
        </TabsTrigger>
        <TabsTrigger value="personal" className="flex items-center gap-2 rounded-xl py-4 px-6 transition-colors" style={{
        backgroundColor: activeTab === "personal" ? `${selectedCompany?.cor_principal}10` : undefined,
        borderColor: activeTab === "personal" ? selectedCompany?.cor_principal : undefined,
        color: activeTab === "personal" ? selectedCompany?.cor_principal : undefined
      }}>
          <File className="h-4 w-4" />
          Meus Documentos
        </TabsTrigger>
      </TabsList>
      
      <div className="mt-10 mb-16 space-y-8">
        {["all", "company", "personal"].map(tabValue => <TabsContent key={tabValue} value={tabValue} className="m-0">
            {tabValue === "personal" && <DocumentUploadForm open={uploadOpen} onOpenChange={setUploadOpen} onUpload={onUpload} isUploading={isUploading} />}
            
            {/* Conditional rendering based on documents */}
            {hasDocuments ? <DocumentList documents={getFilteredDocuments(tabValue)} onDownload={onDownload} onPreview={onPreview} onDelete={onDelete} canDeleteDocument={canDeleteDocument} /> : <EmptyDocumentsState />}
          </TabsContent>)}
      </div>
    </Tabs>;
};