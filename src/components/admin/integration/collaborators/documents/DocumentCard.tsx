import { FileText, Download, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserDocument, DOCUMENT_TYPE_LABELS } from "@/types/document";
import { format } from "date-fns";

interface DocumentCardProps {
  document: UserDocument;
  downloadingId: string | null;
  deletingId: string | null;
  canDeleteDocument: boolean;
  onPreview: () => void;
  onDownload: () => void;
  onDelete: () => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  downloadingId,
  deletingId,
  canDeleteDocument,
  onPreview,
  onDownload,
  onDelete,
}) => {
  // Function to truncate long file names
  const truncateFileName = (name: string, maxLength = 40) => {
    if (name.length <= maxLength) return name;
    
    const extension = name.split('.').pop();
    const nameWithoutExt = name.substring(0, name.lastIndexOf('.'));
    
    // Keep the file extension and truncate the name
    return `${nameWithoutExt.substring(0, maxLength - extension!.length - 4)}...${extension ? `.${extension}` : ''}`;
  };

  return (
    <Card key={document.id} className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center max-w-[70%]">
            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full mr-3 flex-shrink-0">
              <FileText className="h-5 w-5 text-blue-500" />
            </div>
            <div className="overflow-hidden">
              <p className="font-medium truncate" title={document.name}>
                {truncateFileName(document.name)}
              </p>
              <div className="flex text-sm text-gray-500 space-x-2">
                <span className="truncate">
                  {DOCUMENT_TYPE_LABELS[document.document_type] || document.document_type}
                </span>
                <span>•</span>
                <span>{format(new Date(document.uploaded_at), 'dd/MM/yyyy')}</span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2 flex-shrink-0">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onPreview}
              title="Visualizar documento"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onDownload}
              title="Baixar documento"
              disabled={!!downloadingId}
              className={downloadingId === document.id ? "animate-pulse" : ""}
            >
              <Download className="h-4 w-4" />
            </Button>
            {canDeleteDocument && (
              <Button 
                variant="outline" 
                size="icon" 
                onClick={onDelete}
                title="Excluir documento"
                disabled={!!deletingId}
                className={`${deletingId === document.id ? "animate-pulse" : ""} text-red-500 hover:bg-red-50 hover:text-red-600`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
