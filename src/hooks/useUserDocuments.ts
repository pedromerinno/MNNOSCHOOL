
import { useState, useCallback, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserDocument, DocumentType } from "@/types/document";
import { useDocumentFetching } from './documents/useDocumentFetching';

export const useUserDocuments = (userId: string | null, companyId: string | null) => {
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { fetchDocumentsForUser } = useDocumentFetching();

  // Function to check if storage bucket exists
  const checkBucketExists = useCallback(async () => {
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.warn("Erro ao verificar buckets:", error);
        return false;
      }
      
      const documentsBucket = buckets?.find(b => b.name === 'documents');
      
      if (!documentsBucket) {
        console.warn("Bucket 'documents' não encontrado. Verifique se ele foi criado no Supabase.");
        return false;
      }
      
      return true;
    } catch (err) {
      console.error("Erro ao verificar storage bucket:", err);
      return false;
    }
  }, []);

  // Function to fetch documents for a specific user
  const fetchDocuments = useCallback(async () => {
    if (!userId || !companyId) {
      setDocuments([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching documents for user ${userId} in company ${companyId}`);
      
      const docs = await fetchDocumentsForUser(userId, companyId);
      setDocuments(docs);
    } catch (error: any) {
      console.error('Error fetching user documents:', error);
      setError(`Erro ao buscar documentos: ${error.message}`);
      toast.error(`Erro ao buscar documentos: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [userId, companyId, fetchDocumentsForUser]);

  // Initial document fetch
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Function to upload document
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
      const bucketExists = await checkBucketExists();
      
      if (!bucketExists) {
        toast.error("Sistema de armazenamento não está disponível. Contate o administrador.");
        return null;
      }
      
      const userDir = `user-documents/${userId}`;
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

      // Get the current authenticated user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        throw new Error("Usuário não autenticado");
      }

      // Insert document record - using the current user's ID as uploaded_by
      const { data, error } = await supabase
        .from('user_documents')
        .insert({
          user_id: userId, // The user who owns the document
          company_id: companyId,
          name: file.name,
          file_path: filePath,
          file_type: file.type,
          document_type: documentType,
          description: description || null,
          uploaded_by: authUser.id // The admin who uploaded it
        })
        .select()
        .single();

      if (error) throw error;

      const newDoc = data as unknown as UserDocument;
      setDocuments(prev => [...prev, newDoc]);
      toast.success('Documento enviado com sucesso');
      return newDoc;
    } catch (error: any) {
      console.error('Error uploading document:', error);
      
      if (error.message.includes("storage/bucket-not-found")) {
        toast.error("Armazenamento não configurado. Contate o administrador.");
      } else if (error.message.includes("already exists")) {
        toast.error("Um arquivo com este nome já existe. Tente novamente.");
      } else {
        toast.error(`Erro no upload: ${error.message}`);
      }
      
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [userId, companyId, checkBucketExists]);

  // Function to delete document
  const deleteDocument = useCallback(async (documentId: string): Promise<boolean> => {
    if (!documentId) {
      toast.error("ID do documento não fornecido");
      return false;
    }

    try {
      const { data: document, error: fetchError } = await supabase
        .from('user_documents')
        .select('file_path')
        .eq('id', documentId)
        .single();

      if (fetchError) throw fetchError;

      // Get current user profile to check admin status
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado");
        return false;
      }
      
      // Check if user is admin
      const { data: profileData } = await supabase
        .from('profiles')
        .select('is_admin, super_admin')
        .eq('id', user.id)
        .single();
        
      const isAdmin = profileData?.is_admin || profileData?.super_admin;
      
      // Admin privilege check happens in the confirmDelete function now

      const bucketExists = await checkBucketExists();
      
      if (!bucketExists) {
        toast.error("Sistema de armazenamento não está disponível");
        return false;
      }

      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path]);

      if (storageError) {
        console.warn("Erro ao remover arquivo do storage:", storageError);
      }

      const { error: deleteError } = await supabase
        .from('user_documents')
        .delete()
        .eq('id', documentId);

      if (deleteError) throw deleteError;

      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      toast.success('Documento excluído com sucesso');
      return true;
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error(`Erro ao excluir documento: ${error.message}`);
      return false;
    }
  }, [checkBucketExists]);

  return {
    documents,
    isLoading,
    isUploading,
    error,
    uploadDocument,
    deleteDocument,
    refreshDocuments: fetchDocuments
  };
};
