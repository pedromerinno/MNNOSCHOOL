
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserDocument } from "@/types/document";
import { useAuth } from '@/contexts/AuthContext';
import { useCompanies } from '@/hooks/useCompanies';

export const useDocumentFetching = () => {
  const { user } = useAuth();
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
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', user.id)
        .eq('company_id', selectedCompany.id)
        .order('uploaded_at', { ascending: false });
        
      if (error) throw error;
      
      setDocuments(data as UserDocument[]);
    } catch (error: any) {
      console.error('Error fetching user documents:', error);
      setError(`Erro ao carregar documentos: ${error.message}`);
      toast.error(`Erro ao carregar documentos: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [user, selectedCompany]);

  // Add a special method to fetch documents for a specific user (for admins)
  const fetchDocumentsForUser = useCallback(async (userId: string, companyId: string) => {
    if (!userId || !companyId) {
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', userId)
        .eq('company_id', companyId)
        .order('uploaded_at', { ascending: false });
        
      if (error) throw error;
      
      return data as UserDocument[];
    } catch (error: any) {
      console.error('Error fetching user documents:', error);
      toast.error(`Erro ao carregar documentos: ${error.message}`);
      return [];
    }
  }, []);

  return {
    documents,
    isLoading,
    error,
    fetchUserDocuments,
    fetchDocumentsForUser,
  };
};
