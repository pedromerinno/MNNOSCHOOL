
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

  return (
    <PageLayout title="Documentos">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="company" className="flex items-center">
            <FolderOpen className="h-4 w-4 mr-2" />
            Documentos da Empresa
          </TabsTrigger>
          <TabsTrigger value="personal" className="flex items-center">
            <File className="h-4 w-4 mr-2" />
            Meus Documentos
          </TabsTrigger>
        </TabsList>
        
        <Separator className="my-6" />
        
        <TabsContent value="personal" className="mt-6">
          <DocumentUploadForm
            open={uploadOpen}
            onOpenChange={setUploadOpen}
            onUpload={handleUpload}
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
