
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DocumentType, UserDocument } from '@/types/document';
import { useStorageOperations } from './useStorageOperations';
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from './constants';

export const useDocumentUploadOperations = (
  userId: string | null,
  companyId: string | null,
  setDocuments: React.Dispatch<React.SetStateAction<UserDocument[]>>,
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const [fileError, setFileError] = useState<string | null>(null);
  const { uploadToStorage } = useStorageOperations();

  const validateFile = (file: File): boolean => {
    if (!file) {
      setFileError("Por favor, selecione um arquivo");
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError("O arquivo não pode ser maior que 10MB");
      return false;
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setFileError("Tipo de arquivo não permitido. Use PDF, DOC, DOCX, JPG ou PNG.");
      return false;
    }

    setFileError(null);
    return true;
  };

  const uploadDocument = async (
    file: File,
    documentType: DocumentType,
    description: string
  ): Promise<boolean> => {
    if (!validateFile(file)) return false;
    
    if (!userId) {
      toast.error("Usuário não autenticado");
      return false;
    }

    setIsUploading(true);
    
    try {
      // Buscar companyId se não fornecido
      let targetCompanyId = companyId;
      
      if (!targetCompanyId) {
        const { data: userCompany } = await supabase
          .from('user_empresa')
          .select('empresa_id')
          .eq('user_id', userId)
          .single();
          
        if (!userCompany) {
          throw new Error("Empresa não encontrada");
        }
        
        targetCompanyId = userCompany.empresa_id;
      }
      
      // Criar um diretório único para o usuário
      const filePath = await uploadToStorage(file);
      
      if (!filePath) {
        throw new Error("Falha ao fazer upload do arquivo para o storage");
      }
      
      // Inserir registro do documento
      const { data: newDocument, error: insertError } = await supabase
        .from('user_documents')
        .insert({
          user_id: userId,
          company_id: targetCompanyId,
          name: file.name,
          file_path: filePath,
          file_type: file.type,
          document_type: documentType,
          description: description || null,
          uploaded_by: userId
        })
        .select('*')
        .single();
        
      if (insertError) throw insertError;
      
      // Atualizar o estado local com o novo documento
      if (newDocument) {
        setDocuments(current => [newDocument, ...current]);
      }
      
      toast.success("Documento enviado com sucesso");
      return true;
    } catch (error: any) {
      console.error("Erro ao fazer upload do documento:", error);
      if (error.message.includes('storage')) {
        toast.error("Erro no sistema de armazenamento. Verifique se o bucket 'documents' existe.");
      } else {
        toast.error(`Falha ao enviar documento: ${error.message}`);
      }
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadDocument,
    fileError,
    setFileError
  };
};
