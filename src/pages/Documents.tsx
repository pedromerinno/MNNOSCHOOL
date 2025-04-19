
import { useState } from 'react';
import { PageLayout } from "@/components/layout/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserDocumentsViewer } from "@/hooks/useUserDocumentsViewer";
import { Separator } from "@/components/ui/separator";
import { useCompanies } from '@/hooks/useCompanies';
import { FolderOpen, File } from "lucide-react";
import { DocumentPreview } from "@/components/documents/DocumentPreview";
import { DocumentUploadForm } from "@/components/documents/DocumentUploadForm";
import { DocumentList } from "@/components/documents/DocumentList";
import { UserDocument, DocumentType } from "@/types/document";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useDocuments } from "@/hooks/useDocuments";

const Documents = () => {
  const { selectedCompany } = useCompanies();
  const [activeTab, setActiveTab] = useState("company");
  const { 
    documents, 
    isLoading, 
    downloadDocument, 
    deleteDocument, 
    refreshDocuments 
  } = useUserDocumentsViewer();
  
  const { isUploading, handleUpload, canDeleteDocument } = useDocuments();
  
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handlePreview = async (document: UserDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.file_path, 3600);
        
      if (error) throw error;
      
      setPreviewUrl(data.signedUrl);
      setPreviewOpen(true);
    } catch (error: any) {
      console.error('Error previewing document:', error);
      toast.error(`Falha ao visualizar o documento: ${error.message}`);
    }
  };

  const handleDelete = async (document: UserDocument): Promise<void> => {
    if (window.confirm(`Tem certeza que deseja excluir o documento "${document.name}"?`)) {
      await deleteDocument(document.id);
      refreshDocuments();
    }
  };

  const handleDocumentUpload = async (file: File, documentType: DocumentType, description: string): Promise<boolean> => {
    return await handleUpload(file, documentType, description);
  };

  return (
    <PageLayout title="Documentos">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full rounded-2xl p-1.5 bg-transparent dark:bg-transparent gap-2">
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
          <TabsContent value="company" className="m-0">
            <DocumentUploadForm
              open={uploadOpen}
              onOpenChange={setUploadOpen}
              onUpload={handleDocumentUpload}
              isUploading={isUploading}
            />
            
            <DocumentList
              documents={documents}
              onDownload={downloadDocument}
              onPreview={handlePreview}
              onDelete={handleDelete}
              canDeleteDocument={canDeleteDocument}
            />
          </TabsContent>
          
          <TabsContent value="personal" className="m-0">
            <DocumentUploadForm
              open={uploadOpen}
              onOpenChange={setUploadOpen}
              onUpload={handleDocumentUpload}
              isUploading={isUploading}
            />
            
            <DocumentList
              documents={documents}
              onDownload={downloadDocument}
              onPreview={handlePreview}
              onDelete={handleDelete}
              canDeleteDocument={canDeleteDocument}
            />
          </TabsContent>
        </div>
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
