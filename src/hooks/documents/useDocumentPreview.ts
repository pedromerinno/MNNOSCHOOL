
import { useState } from 'react';
import { UserDocument } from "@/types/document";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDocumentPreview = () => {
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

  return {
    previewUrl,
    previewOpen,
    setPreviewOpen,
    handlePreview
  };
};
