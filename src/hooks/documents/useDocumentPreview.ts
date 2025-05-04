
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserDocument } from "@/types/document";

export const useDocumentPreview = () => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handlePreview = async (document: UserDocument): Promise<void> => {
    try {
      console.log("Generating preview URL for document:", document.file_path);
      
      // Create a signed URL for the document
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.file_path, 3600); // URL valid for 1 hour
        
      if (error) {
        throw error;
      }
      
      setPreviewUrl(data.signedUrl);
      setPreviewOpen(true);
    } catch (error: any) {
      console.error('Error previewing document:', error);
      toast.error(`Falha ao visualizar o documento: ${error.message}`);
    }
  };

  return { previewUrl, previewOpen, setPreviewOpen, handlePreview };
};
