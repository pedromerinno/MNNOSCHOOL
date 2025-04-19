
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DocumentType, UserDocument } from "@/types/document";
import { useDocumentValidation } from './useDocumentValidation';

export const useDocumentUploadOperations = (
  userId: string | null,
  companyId: string | null,
  setDocuments: (docs: UserDocument[]) => void,
  setIsUploading: (loading: boolean) => void
) => {
  const { checkBucketExists } = useDocumentValidation();

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
  }, [userId, companyId, checkBucketExists, setDocuments, setIsUploading]);

  return { uploadDocument };
};
