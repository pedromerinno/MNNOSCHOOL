
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserDocument, DocumentType } from "@/types/document";

export const useUserDocuments = (userId: string | null, companyId: string | null) => {
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verifica se o bucket documents existe
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

  // Fetch user documents
  const fetchDocuments = useCallback(async () => {
    if (!userId || !companyId) {
      setDocuments([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Check if bucket exists
      const bucketExists = await checkBucketExists();
      
      if (!bucketExists) {
        console.warn("Storage bucket não disponível, continuando mesmo assim");
      }
      
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
      setError(`Erro ao buscar documentos: ${error.message}`);
      toast.error(`Erro ao buscar documentos: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [userId, companyId, checkBucketExists]);

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
      // Check if bucket exists
      const bucketExists = await checkBucketExists();
      
      if (!bucketExists) {
        toast.error("Sistema de armazenamento não está disponível. Contate o administrador.");
        return null;
      }
      
      // 1. Upload file to storage
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

  // Delete a document
  const deleteDocument = useCallback(async (documentId: string): Promise<boolean> => {
    try {
      // Check if bucket exists first
      const bucketExists = await checkBucketExists();
      
      if (!bucketExists) {
        toast.error("Sistema de armazenamento não está disponível. Contate o administrador.");
        return false;
      }
      
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

        if (storageError) {
          console.warn("Erro ao remover arquivo do storage (continuando mesmo assim):", storageError);
          // Continue despite storage error - we still want to remove the database record
        }
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
