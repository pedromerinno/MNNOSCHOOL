
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserDocument, DocumentType } from "@/types/document";

export const useUserDocuments = (userId: string | null, companyId: string | null) => {
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch user documents
  const fetchDocuments = useCallback(async () => {
    if (!userId || !companyId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', userId)
        .eq('company_id', companyId);

      if (error) throw error;
      
      // Type assertion to force cast to our type - we know the structure matches
      setDocuments(data as unknown as UserDocument[]);
    } catch (error: any) {
      console.error('Error fetching user documents:', error);
      toast.error(`Erro ao buscar documentos: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [userId, companyId]);

  // Upload a document for a user
  const uploadDocument = useCallback(async (
    file: File, 
    documentType: DocumentType, 
    description?: string
  ): Promise<UserDocument | null> => {
    if (!userId || !companyId || !file) {
      toast.error('Informações insuficientes para upload');
      return null;
    }

    setIsUploading(true);
    try {
      // 1. Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `user-documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Create database record using any type to bypass TypeScript checks since we know the structure
      const { data, error } = await supabase
        .from('user_documents')
        .insert({
          user_id: userId,
          company_id: companyId,
          name: file.name,
          file_path: filePath,
          file_type: file.type,
          document_type: documentType,
          description: description || null,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id || userId
        })
        .select()
        .single();

      if (error) throw error;

      // Cast to UserDocument type
      const newDoc = data as unknown as UserDocument;
      setDocuments(prev => [...prev, newDoc]);
      toast.success('Documento enviado com sucesso');
      return newDoc;
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.error(`Erro no upload: ${error.message}`);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [userId, companyId]);

  // Delete a document
  const deleteDocument = useCallback(async (documentId: string): Promise<boolean> => {
    try {
      // 1. Get document details to find the file path
      const { data: document, error: fetchError } = await supabase
        .from('user_documents')
        .select('file_path')
        .eq('id', documentId)
        .single();

      if (fetchError) throw fetchError;

      // 2. Delete the file from storage
      if (document && (document as any).file_path) {
        const filePath = (document as any).file_path;
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([filePath]);

        if (storageError) throw storageError;
      }

      // 3. Delete the database record
      const { error } = await supabase
        .from('user_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      // 4. Update state
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      toast.success('Documento excluído com sucesso');
      return true;
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error(`Erro ao excluir documento: ${error.message}`);
      return false;
    }
  }, []);

  return {
    documents,
    isLoading,
    isUploading,
    uploadDocument,
    deleteDocument,
    refreshDocuments: fetchDocuments
  };
};
