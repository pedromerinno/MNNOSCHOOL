
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useDocumentValidation } from './useDocumentValidation';
import { UserDocument } from '@/types/document';

export const useDocumentDeleteOperations = (
  setDocuments: React.Dispatch<React.SetStateAction<UserDocument[]>>
) => {
  const { createBucketIfNotExists } = useDocumentValidation();

  const deleteDocument = useCallback(async (documentId: string): Promise<boolean> => {
    if (!documentId) {
      toast.error("ID do documento não fornecido");
      return false;
    }

    try {
      console.log("Iniciando exclusão do documento:", documentId);
      
      // Fetch document details
      const { data: document, error: fetchError } = await supabase
        .from('user_documents')
        .select('file_path, uploaded_by, user_id, company_id')
        .eq('id', documentId)
        .single();

      if (fetchError) {
        console.error("Erro ao buscar detalhes do documento:", fetchError);
        throw new Error(`Não foi possível obter informações do documento: ${fetchError.message}`);
      }

      if (!document) {
        toast.error("Documento não encontrado");
        return false;
      }

      console.log("Documento encontrado:", document);

      // Get current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error("Erro de autenticação:", authError);
        toast.error("Usuário não autenticado");
        return false;
      }

      console.log("Usuário autenticado:", user.id);

      // Check if user is admin or super_admin
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin, super_admin')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        console.error("Erro ao verificar perfil do usuário:", profileError);
      }
      
      const isAdmin = profileData?.is_admin || profileData?.super_admin;
      console.log("Usuário é admin:", isAdmin);

      // Only allow deletion if user is the uploader, the owner, or an admin
      const canDelete = document.uploaded_by === user.id || isAdmin || document.user_id === user.id;
      
      if (!canDelete) {
        toast.error("Você não tem permissão para excluir este documento");
        return false;
      }

      // First, check if storage bucket exists
      try {
        console.log("Verificando bucket de armazenamento...");
        
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        
        if (listError) {
          console.error("Erro ao listar buckets:", listError);
          throw new Error(`Erro ao listar buckets: ${listError.message}`);
        }
        
        const documentsBucket = buckets?.find(b => b.name === 'documents');
        
        console.log("Buckets encontrados:", buckets?.map(b => b.name).join(', '));
        
        if (!documentsBucket) {
          console.log("Bucket 'documents' não encontrado. Tentando criar...");
          
          const { error: createError } = await supabase.storage.createBucket('documents', {
            public: false,
            fileSizeLimit: 10485760, // 10MB
          });
          
          if (createError) {
            console.error("Erro ao criar bucket:", createError);
            // Continue with DB deletion even if bucket creation fails
          } else {
            console.log("Bucket criado com sucesso");
          }
        } else {
          console.log("Bucket 'documents' encontrado");
        }
      } catch (bucketError: any) {
        console.error("Erro ao verificar/criar bucket:", bucketError);
        // Continue with deletion anyway, just log the error
      }

      console.log("Tentando remover arquivo:", document.file_path);
      
      // Try to remove the file from storage, but continue even if it fails
      try {
        const { error: removeError } = await supabase.storage
          .from('documents')
          .remove([document.file_path]);

        if (removeError) {
          console.warn("Aviso durante remoção do arquivo:", removeError);
          console.log("Continuando com exclusão do registro no banco de dados...");
          // Continue with database record deletion even if file removal fails
        } else {
          console.log("Arquivo removido com sucesso!");
        }
      } catch (storageError: any) {
        console.warn("Erro ao remover arquivo do storage:", storageError);
        console.log("Continuando com exclusão do registro no banco de dados...");
        // Don't return false here, we still want to delete the database record
      }

      console.log("Removendo registro do banco de dados...");
      
      // Delete the database record
      const { error: deleteError } = await supabase
        .from('user_documents')
        .delete()
        .eq('id', documentId);

      if (deleteError) {
        console.error("Erro ao excluir registro do documento:", deleteError);
        throw new Error(`Falha ao excluir o registro do documento: ${deleteError.message}`);
      }

      console.log("Documento excluído com sucesso!");
      
      // Update the state to remove the deleted document
      setDocuments(currentDocs => currentDocs.filter(doc => doc.id !== documentId));
      toast.success('Documento excluído com sucesso');
      return true;
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error(`Falha ao excluir o documento: ${error.message}`);
      return false;
    }
  }, [createBucketIfNotExists, setDocuments]);

  return { deleteDocument };
};
