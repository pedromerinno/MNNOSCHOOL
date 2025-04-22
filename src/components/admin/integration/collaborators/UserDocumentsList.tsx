
import React, { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { UserDocument } from "@/types/document";
import { DocumentCard } from './documents/DocumentCard';
import { EmptyDocumentsList } from './documents/EmptyDocumentsList';
import { useUserDocumentsList } from '@/hooks/useUserDocumentsList';

interface UserDocumentsListProps {
  documents: UserDocument[];
  isLoading: boolean;
  onDelete: (documentId: string) => Promise<boolean>;
  onUploadClick: () => void;
  userId: string;
  companyId: string;
  onRefresh: () => Promise<void>;
}

export const UserDocumentsList: React.FC<UserDocumentsListProps> = ({
  documents,
  isLoading,
  onDelete,
  onUploadClick,
  userId,
  companyId,
  onRefresh
}) => {
  const {
    downloadingId,
    deletingId,
    error,
    previewUrl,
    previewOpen,
    setPreviewOpen,
    currentUserId,
    handleDownload,
    handlePreview,
    confirmDelete,
    fetchDocumentsForUser
  } = useUserDocumentsList(onDelete);
  
  const [refreshing, setRefreshing] = useState(false);

  // Handle manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

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
          onClick={handleRefresh}
        >
          Tentar novamente
        </Button>
      </Alert>
    );
  }

  if (documents.length === 0) {
    return (
      <div>
        <div className="flex justify-end mb-4">
          <Button 
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="mr-2"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
        <EmptyDocumentsList onUploadClick={onUploadClick} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="mr-2"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>
      
      {documents.map(document => (
        <DocumentCard
          key={document.id}
          document={document}
          downloadingId={downloadingId}
          deletingId={deletingId}
          canDeleteDocument={true} // Admins can delete all documents
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
