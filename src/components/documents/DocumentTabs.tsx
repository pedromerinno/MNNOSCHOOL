
import { DocumentType } from "@/types/document";
import { UserDocument } from "@/types/document";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { DocumentList } from "./DocumentList";

interface DocumentTabsProps {
  documents: UserDocument[];
  uploadOpen: boolean;
  setUploadOpen: (open: boolean) => void;
  isUploading: boolean;
  onUpload: (file: File, documentType: DocumentType, description: string) => Promise<boolean>;
  onDownload: (document: UserDocument) => Promise<void>;
  onPreview: (document: UserDocument) => Promise<void>;
  onDelete: (document: UserDocument) => Promise<void>;
  canDeleteDocument: (document: UserDocument) => boolean;
  showUploadButton: boolean;
}

export const DocumentTabs: React.FC<DocumentTabsProps> = ({
  documents,
  uploadOpen,
  setUploadOpen,
  isUploading,
  onUpload,
  onDownload,
  onPreview,
  onDelete,
  canDeleteDocument,
  showUploadButton
}) => {
  return (
    <div className="space-y-4">
      {showUploadButton && (
        <div className="flex justify-end">
          <Button onClick={() => setUploadOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Fazer Upload
          </Button>
        </div>
      )}

      <DocumentList
        documents={documents}
        onDownload={onDownload}
        onPreview={onPreview}
        onDelete={onDelete}
        canDeleteDocument={canDeleteDocument}
      />
    </div>
  );
};
