import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FileText, Download, Eye, Trash2, Link as LinkIcon } from "lucide-react";
import { UserDocument, DOCUMENT_TYPE_LABELS } from "@/types/document";
import { format } from "date-fns";
import { DocumentDetailsDialog } from './DocumentDetailsDialog';
import { EditUserDocumentDialog } from './EditUserDocumentDialog';
import { limitWords } from "@/utils/stringUtils";

interface DocumentTableViewProps {
  documents: UserDocument[];
  onDownload: (document: UserDocument) => Promise<void>;
  onPreview: (document: UserDocument) => Promise<void>;
  onDelete: (document: UserDocument) => Promise<void>;
  onUpdate?: (
    documentId: string,
    name: string,
    description: string,
    documentType: any,
    thumbnailPath?: string | null
  ) => Promise<boolean>;
  canDeleteDocument: (document: UserDocument) => boolean;
  onAddDocument?: () => void;
  companyColor: string;
}

/**
 * Função para obter o ícone apropriado baseado no tipo de arquivo
 */
const getFileIcon = (fileName?: string, attachmentType?: 'file' | 'link') => {
  if (attachmentType === 'link') {
    return LinkIcon;
  }
  if (!fileName) return FileText;
  return FileText;
};

export const DocumentTableView = ({
  documents,
  onDownload,
  onPreview,
  onDelete,
  onUpdate,
  canDeleteDocument,
  onAddDocument,
  companyColor
}: DocumentTableViewProps) => {
  const [selectedDocument, setSelectedDocument] = useState<UserDocument | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<UserDocument | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleCardClick = (document: UserDocument) => {
    setSelectedDocument(document);
    setIsDetailsDialogOpen(true);
  };

  const handlePreviewFromDialog = async () => {
    if (selectedDocument) {
      await onPreview(selectedDocument);
    }
  };

  const handleDownloadFromDialog = async () => {
    if (selectedDocument) {
      await onDownload(selectedDocument);
    }
  };

  if (documents.length === 0) {
    return (
      <div className="w-full">
        <EmptyState
          title="Nenhum documento encontrado"
          description="Não há documentos pessoais nesta categoria."
          icons={[FileText]}
          action={onAddDocument ? {
            label: "Adicionar Documento",
            onClick: onAddDocument
          } : undefined}
        />
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-900">
            <TableRow>
              <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Nome</TableHead>
              <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Tipo</TableHead>
              <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Data de Upload</TableHead>
              <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Tipo de Anexo</TableHead>
              <TableHead className="text-right font-semibold">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => {
              const FileIcon = getFileIcon(doc.name, doc.attachment_type);
              return (
                <TableRow 
                  key={doc.id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                  onClick={() => handleCardClick(doc)}
                >
                  <TableCell className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2 rounded-lg flex-shrink-0"
                        style={{ 
                          backgroundColor: `${companyColor}15`,
                        }}
                      >
                        <FileIcon className="h-4 w-4" style={{ color: companyColor }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="font-medium text-gray-900 dark:text-white truncate">
                                {limitWords(doc.name, 8)}
                              </p>
                            </TooltipTrigger>
                            {doc.name.split(/\s+/).length > 8 && (
                              <TooltipContent>
                                <p className="max-w-xs">{doc.name}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                        {doc.description && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                                  {limitWords(doc.description, 6)}
                                </p>
                              </TooltipTrigger>
                              {doc.description.split(/\s+/).length > 6 && (
                                <TooltipContent>
                                  <p className="max-w-xs">{doc.description}</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className="text-xs"
                    >
                      {DOCUMENT_TYPE_LABELS[doc.document_type as any] || doc.document_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400">
                    {format(new Date(doc.uploaded_at), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    {doc.attachment_type === 'link' ? (
                      <Badge variant="outline" className="text-xs">
                        <LinkIcon className="h-3 w-3 mr-1" />
                        Link
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        <FileText className="h-3 w-3 mr-1" />
                        Arquivo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(doc);
                        }}
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={async (e) => {
                          e.stopPropagation();
                          await onDownload(doc);
                        }}
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {canDeleteDocument(doc) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={async (e) => {
                            e.stopPropagation();
                            await onDelete(doc);
                          }}
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <DocumentDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        document={selectedDocument}
        companyColor={companyColor}
        onPreview={handlePreviewFromDialog}
        onDownload={handleDownloadFromDialog}
        onEdit={selectedDocument && onUpdate ? () => {
          setEditingDocument(selectedDocument);
          setIsEditDialogOpen(true);
          setIsDetailsDialogOpen(false);
        } : undefined}
        canEdit={!!onUpdate}
        isCompanyDocument={false}
      />

      {onUpdate && (
        <EditUserDocumentDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          document={editingDocument}
          onUpdate={onUpdate}
          isUpdating={false}
        />
      )}
    </>
  );
};

