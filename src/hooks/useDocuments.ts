
import { useState, useCallback, useEffect } from 'react';
import { DocumentType, UserDocument } from "@/types/document";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from '@/contexts/AuthContext';
import { useCompanies } from '@/hooks/useCompanies';

export const useDocuments = () => {
  const { userProfile, user } = useAuth();
  const { selectedCompany } = useCompanies();
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUserId(data.user?.id || null);
    };
    
    fetchUserId();
  }, []);

  const handleUpload = async (
    file: File, 
    documentType: DocumentType, 
    description: string
  ) => {
    if (!file || !selectedCompany?.id) {
      toast.error("Por favor, selecione um arquivo e verifique se a empresa está selecionada");
      return;
    }

    setIsUploading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado");
        setIsUploading(false);
        return;
      }
      
      const userDir = `user-documents/${user.id}`;
      const fileExt = file.name.split('.').pop();
      const fileName = `${userDir}/${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { error } = await supabase
        .from('user_documents')
        .insert({
          user_id: user.id,
          company_id: selectedCompany.id,
          name: file.name,
          file_path: filePath,
          file_type: file.type,
          document_type: documentType,
          description: description || null,
          uploaded_by: user.id
        });

      if (error) throw error;

      toast.success('Documento enviado com sucesso');
      return true;
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.error(`Erro no upload: ${error.message}`);
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const canDeleteDocument = (document: UserDocument) => {
    return document.uploaded_by === currentUserId;
  };

  return {
    documents,
    isLoading,
    error,
    isUploading,
    canDeleteDocument,
    handleUpload
  };
};
