
import { useState } from 'react';
import { UserDocument } from "@/types/document";

export const useDocumentsState = () => {
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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
    setCurrentUserId
  };
};
