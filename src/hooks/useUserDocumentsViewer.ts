
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserDocument } from "@/types/document";
import { useAuth } from '@/contexts/AuthContext';
import { useCompanies } from '@/hooks/useCompanies';

export const useUserDocumentsViewer = () => {
  const { userProfile, user } = useAuth();
  const { selectedCompany } = useCompanies();
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchUserDocuments = useCallback(async () => {
    if (!user || !selectedCompany?.id) {
      setDocuments([]);
      setIsLoading(false);
      setError(null);
      return;
    }
    
    // Use user.id from Auth context instead of userProfile.id
    const userId = user.id;
    if (!userId) {
      console.error('User ID is undefined');
      setDocuments([]);
      setIsLoading(false);
      setError("ID do usuário não encontrado");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', userId)
        .eq('company_id', selectedCompany.id);
        
      if (error) throw error;
      
      setDocuments(data as unknown as UserDocument[]);
    } catch (error: any) {
      console.error('Error fetching user documents:', error);
      setError(`Erro ao carregar documentos: ${error.message}`);
      toast.error(`Erro ao carregar documentos: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [user, selectedCompany]);
  
  const downloadDocument = useCallback(async (document: UserDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path);
        
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      // Use window.document instead of 'document' parameter
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.name;
      a.click();
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error: any) {
      console.error('Error downloading document:', error);
      
      if (error.message.includes("storage/object-not-found")) {
        toast.error("Arquivo não encontrado. Pode ter sido excluído.");
      } else {
        toast.error(`Erro ao baixar documento: ${error.message}`);
      }
      
      return false;
    }
  }, []);
  
  useEffect(() => {
    fetchUserDocuments();
  }, [fetchUserDocuments]);
  
  return {
    documents,
    isLoading,
    error,
    downloadDocument,
    refreshDocuments: fetchUserDocuments
  };
};
