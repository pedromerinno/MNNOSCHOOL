
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserDocument } from "@/types/document";
import { useAuth } from '@/contexts/AuthContext';
import { useCompanies } from '@/hooks/useCompanies';

export const useUserDocumentsViewer = () => {
  const { userProfile } = useAuth();
  const { selectedCompany } = useCompanies();
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchUserDocuments = useCallback(async () => {
    if (!userProfile || !selectedCompany?.id) {
      setDocuments([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', userProfile.id || '') // Add fallback empty string
        .eq('company_id', selectedCompany.id);
        
      if (error) throw error;
      
      setDocuments(data as unknown as UserDocument[]);
    } catch (error: any) {
      console.error('Error fetching user documents:', error);
      toast.error(`Erro ao carregar documentos: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [userProfile, selectedCompany]);
  
  const downloadDocument = useCallback(async (document: UserDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path);
        
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      const a = document.createElement('a'); // Use window.document, not the parameter named 'document'
      a.href = url;
      a.download = document.name;
      a.click();
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error: any) {
      console.error('Error downloading document:', error);
      toast.error(`Erro ao baixar documento: ${error.message}`);
      return false;
    }
  }, []);
  
  useEffect(() => {
    fetchUserDocuments();
  }, [fetchUserDocuments]);
  
  return {
    documents,
    isLoading,
    downloadDocument,
    refreshDocuments: fetchUserDocuments
  };
};
