
import { useState, useEffect } from 'react';
import { UserDocument } from "@/types/document";
import { supabase } from "@/integrations/supabase/client";

export const useDocumentsState = () => {
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // Fetch current user ID on initial load
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setCurrentUserId(data.user?.id || null);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    
    fetchUserId();
  }, []);

  return {
    documents,
    setDocuments,
    isLoading,
    setIsLoading,
    error,
    setError,
    isUploading,
    setIsUploading,
    currentUserId,
    setCurrentUserId,
    uploadOpen,
    setUploadOpen,
    fileError,
    setFileError
  };
};
