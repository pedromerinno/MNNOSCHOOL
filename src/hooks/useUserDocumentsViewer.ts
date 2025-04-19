
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
        .eq('company_id', selectedCompany.id)
        .order('uploaded_at', { ascending: false });
        
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

  const deleteDocument = useCallback(async (documentId: string): Promise<boolean> => {
    if (!documentId) {
      toast.error("ID do documento não fornecido");
      return false;
    }

    try {
      // Get current user to verify permissions
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        toast.error("Usuário não autenticado");
        return false;
      }

      // Fetch document details to verify ownership
      const { data: document, error: fetchError } = await supabase
        .from('user_documents')
        .select('file_path, uploaded_by')
        .eq('id', documentId)
        .single();

      if (fetchError) throw fetchError;

      if (!document) {
        toast.error("Documento não encontrado");
        return false;
      }

      // Check if user owns the document
      if (document.uploaded_by !== currentUser.id) {
        toast.error("Você só pode excluir documentos que você mesmo enviou");
        return false;
      }

      // Delete the file from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path]);

      if (storageError) {
        console.warn("Erro ao remover arquivo do storage:", storageError);
      }

      // Delete the document record from the database
      const { error: deleteError } = await supabase
        .from('user_documents')
        .delete()
        .eq('id', documentId);

      if (deleteError) throw deleteError;

      // Update local state
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      toast.success('Documento excluído com sucesso');
      return true;
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error(`Erro ao excluir documento: ${error.message}`);
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
    deleteDocument,
    refreshDocuments: fetchUserDocuments
  };
};
