
import React, { useEffect } from 'react';
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { UserDocument } from "@/types/document";
import { supabase } from "@/integrations/supabase/client";
import { DocumentCard } from './documents/DocumentCard';
import { EmptyDocumentsList } from './documents/EmptyDocumentsList';
import { useUserDocumentsList } from '@/hooks/useUserDocumentsList';

interface UserDocumentsListProps {
  documents: UserDocument[];
  isLoading: boolean;
  onDelete: (documentId: string) => Promise<boolean>;
  onUploadClick: () => void;
}

export const UserDocumentsList: React.FC<UserDocumentsListProps> = ({
  documents,
  isLoading,
  onDelete,
  onUploadClick,
}) => {
  const {
    downloadingId,
    deletingId,
    error,
    previewUrl,
    previewOpen,
    setPreviewOpen,
    currentUserId,
    setCurrentUserId,
    handleDownload,
    handlePreview,
    confirmDelete,
  } = useUserDocumentsList(onDelete);

  useEffect(() => {
    const fetchUserId = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUserId(data.user?.id || null);
    };
    
    fetchUserId();
  }, [setCurrentUserId]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-3"
          onClick={() => window.location.reload()}
        >
          Tentar novamente
        </Button>
      </Alert>
    );
  }

  if (documents.length === 0) {
    return <EmptyDocumentsList onUploadClick={onUploadClick} />;
  }

  return (
    <div className="space-y-3">
      {documents.map(document => (
        <DocumentCard
          key={document.id}
          document={document}
          downloadingId={downloadingId}
          deletingId={deletingId}
          canDeleteDocument={document.uploaded_by === currentUserId}
          onPreview={() => handlePreview(document)}
          onDownload={() => handleDownload(document)}
          onDelete={() => confirmDelete(document)}
        />
      ))}

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          {previewUrl && (
            <iframe
              src={previewUrl}
              className="w-full h-full"
              title="Document preview"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
