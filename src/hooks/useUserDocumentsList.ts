import { useState, useEffect } from 'react';
import { UserDocument } from "@/types/document";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useDocumentFetching } from './documents/useDocumentFetching';
import { useDocumentValidation } from './documents/useDocumentValidation';
import { useDocumentDelete } from './documents/useDocumentDelete';

export const useUserDocumentsList = (onDelete: (documentId: string) => Promise<boolean>) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserIsAdmin, setCurrentUserIsAdmin] = useState<boolean>(false);
  const { fetchDocumentsForUser } = useDocumentFetching();
  const { ensureBucketExists } = useDocumentValidation();
  const { deleteDocument } = useDocumentDelete();
  
  // Fetch the current user for permission checks
  useEffect(() => {
    const fetchUserData = async () => {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error("Error fetching user:", error);
        return;
      }
      
      setCurrentUserId(data.user?.id || null);
      
      if (data.user?.id) {
        // Also check if user is admin
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin, super_admin')
          .eq('id', data.user.id)
          .single();
          
        if (profileError) {
          console.error("Error fetching profile:", profileError);
        } else {
          setCurrentUserIsAdmin(!!profileData?.is_admin || !!profileData?.super_admin);
        }
      }
    };
    
    fetchUserData();
  }, []);

  const handleDownload = async (document: UserDocument) => {
    setDownloadingId(document.id);
    setError(null);
    
    try {
      console.log("Iniciando download do documento:", document.id);
      
      // Ensure bucket exists before attempting download
      const bucketExists = await ensureBucketExists();
      
      if (!bucketExists) {
        console.log("Bucket não existe, tentando criar...");
        
        // Force bucket creation
        const { error } = await supabase.storage.createBucket('documents', {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        });
        
        if (error) {
          console.error("Storage bucket creation error:", error);
          throw new Error("Sistema de armazenamento não está disponível");
        } else {
          console.log("Bucket criado com sucesso!");
        }
      }
      
      console.log("Baixando arquivo:", document.file_path);
      
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path);
        
      if (error) {
        console.error("Download error:", error);
        throw error;
      }
      
      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.name;
      a.click();
      URL.revokeObjectURL(url);
      
      console.log("Download concluído com sucesso!");
      
    } catch (error: any) {
      console.error('Error downloading document:', error);
      
      let errorMessage = 'Falha ao baixar o documento';
      
      if (error.message.includes("storage/object-not-found")) {
        errorMessage = "Arquivo não encontrado. Pode ter sido excluído.";
      } else {
        errorMessage = `Falha ao baixar o documento: ${error.message}`;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setDownloadingId(null);
    }
  };

  const handlePreview = async (document: UserDocument) => {
    try {
      console.log("Iniciando visualização do documento:", document.id);
      
      // Ensure bucket exists before attempting preview
      const bucketExists = await ensureBucketExists();
      
      if (!bucketExists) {
        console.log("Bucket não existe, tentando criar...");
        
        // Force bucket creation
        const { error } = await supabase.storage.createBucket('documents', {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        });
        
        if (error) {
          console.error("Storage bucket creation error:", error);
          throw new Error("Sistema de armazenamento não está disponível");
        } else {
          console.log("Bucket criado com sucesso!");
        }
      }
      
      console.log("Criando URL assinada para:", document.file_path);
      
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.file_path, 3600);
        
      if (error) {
        console.error("Preview error:", error);
        throw error;
      }
      
      console.log("URL assinada criada com sucesso:", data.signedUrl);
      
      setPreviewUrl(data.signedUrl);
      setPreviewOpen(true);
    } catch (error: any) {
      console.error('Error previewing document:', error);
      toast.error(`Falha ao visualizar o documento: ${error.message}`);
    }
  };

  const confirmDelete = async (document: UserDocument) => {
    console.log("Solicitação para excluir documento:", document.id);
    
    // Get the current user to check if they're an admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error("Auth error:", authError);
      toast.error("Usuário não autenticado");
      return;
    }
    
    console.log("Usuário atual:", user.id);
    
    // Check if the current user is allowed to delete this document
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin, super_admin')
      .eq('id', user?.id)
      .single();
    
    if (profileError) {
      console.error("Error fetching profile:", profileError);
    }
    
    const isAdmin = profileData?.is_admin || profileData?.super_admin;
    console.log("Usuário é admin:", isAdmin);
    
    // Allow deletion if the user is the owner, the uploader, or an admin
    const canDelete = document.uploaded_by === user?.id || document.user_id === user?.id || isAdmin;
    
    if (canDelete) {
      if (window.confirm(`Tem certeza que deseja excluir o documento "${document.name}"?`)) {
        setDeletingId(document.id);
        setError(null);
        
        console.log("Iniciando processo de exclusão...");
        
        try {
          // Usar a função onDelete que foi passada como prop
          const result = await onDelete(document.id);
          
          if (!result) {
            console.error("Deletion returned false");
            throw new Error("Falha ao excluir o documento. Tente novamente.");
          }
          
          console.log("Documento excluído com sucesso!");
        } catch (error: any) {
          console.error("Delete error:", error);
          setError(`Falha ao excluir o documento: ${error.message}`);
          toast.error(`Falha ao excluir o documento: ${error.message}`);
        } finally {
          setDeletingId(null);
        }
      }
    } else {
      console.warn("User doesn't have permission to delete this document");
      toast.error("Você só pode excluir documentos que você mesmo enviou ou se for administrador.");
    }
  };

  return {
    downloadingId,
    deletingId,
    error,
    previewUrl,
    previewOpen,
    setPreviewOpen,
    currentUserId,
    currentUserIsAdmin,
    handleDownload,
    handlePreview,
    confirmDelete,
    fetchDocumentsForUser
  };
};
