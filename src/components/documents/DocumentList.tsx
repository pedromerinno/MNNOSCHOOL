
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, Trash2 } from "lucide-react";
import { UserDocument, DOCUMENT_TYPE_LABELS } from "@/types/document";
import { format } from "date-fns";

interface DocumentListProps {
  documents: UserDocument[];
  onDownload: (document: UserDocument) => Promise<void>;
  onPreview: (document: UserDocument) => Promise<void>;
  onDelete: (document: UserDocument) => Promise<void>;
  canDeleteDocument: (document: UserDocument) => boolean;
}

export const DocumentList = ({
  documents,
  onDownload,
  onPreview,
  onDelete,
  canDeleteDocument
}: DocumentListProps) => {
  const truncateFileName = (name: string, maxLength = 30) => {
    if (name.length <= maxLength) return name;
    
    const extension = name.split('.').pop();
    const nameWithoutExt = name.substring(0, name.lastIndexOf('.'));
    
    return `${nameWithoutExt.substring(0, maxLength - extension!.length - 4)}...${extension ? `.${extension}` : ''}`;
  };

  const documentsByType = documents.reduce((acc, doc) => {
    if (!acc[doc.document_type]) {
      acc[doc.document_type] = [];
    }
    acc[doc.document_type].push(doc);
    return acc;
  }, {} as Record<string, UserDocument[]>);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {Object.entries(documentsByType).map(([type, docs]) => (
        <Card key={type}>
          <CardHeader>
            <CardTitle>{DOCUMENT_TYPE_LABELS[type as any] || type}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {docs.map((doc) => (
                <div 
                  key={doc.id}
                  className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center overflow-hidden">
                    <FileText className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                    <div className="overflow-hidden">
                      <p className="font-medium truncate" title={doc.name}>
                        {truncateFileName(doc.name)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(doc.uploaded_at), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 flex-shrink-0">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onPreview(doc)}
                      title="Visualizar documento"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onDownload(doc)}
                      title="Baixar documento"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {canDeleteDocument(doc) && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onDelete(doc)}
                        title="Excluir documento"
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
