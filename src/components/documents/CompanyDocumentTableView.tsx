import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Download, Eye, Trash2, FileText, Link, Building, Users, Lock, Edit, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CompanyDocument, COMPANY_DOCUMENT_TYPE_LABELS } from '@/types/company-document';
import { DocumentDetailsDialog } from './DocumentDetailsDialog';
import { useCompanies } from "@/hooks/useCompanies";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/company/useIsAdmin";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { limitWords } from "@/utils/stringUtils";

/**
 * Função para obter o ícone apropriado baseado no tipo de arquivo
 */
const getFileIcon = (fileName?: string, attachmentType?: 'file' | 'link') => {
  if (attachmentType === 'link') {
    return Link;
  }
  if (!fileName) return FileText;
  return FileText;
};

interface CompanyDocumentTableViewProps {
  documents: CompanyDocument[];
  onDownload: (document: CompanyDocument) => Promise<void>;
  onPreview: (document: CompanyDocument) => Promise<void>;
  onDelete: (document: CompanyDocument) => Promise<void>;
  onEdit?: (document: CompanyDocument) => void;
  canDeleteDocument: (document: CompanyDocument) => boolean;
  onAddDocument?: () => void;
}

export const CompanyDocumentTableView: React.FC<CompanyDocumentTableViewProps> = ({
  documents,
  onDownload,
  onPreview,
  onDelete,
  onEdit,
  canDeleteDocument,
  onAddDocument
}) => {
  const { selectedCompany } = useCompanies();
  const { userProfile } = useAuth();
  const { isAdmin, isLoading } = useIsAdmin();
  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";
  const canUpload = !isLoading && isAdmin;
  const [selectedDocument, setSelectedDocument] = useState<CompanyDocument | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const canEditDocument = (document: CompanyDocument): boolean => {
    // Apenas admins podem editar
    if (!isAdmin) return false;
    // Só pode editar documentos que ele mesmo criou
    return document.created_by === userProfile?.id;
  };

  const handleCardClick = (document: CompanyDocument) => {
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
          description="Não há documentos da empresa nesta categoria."
          icons={[Building, FileText]}
          action={canUpload && onAddDocument ? {
            label: "Adicionar Documento da Empresa",
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
              <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Acesso</TableHead>
              <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Data de Criação</TableHead>
              <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Tipo de Anexo</TableHead>
              <TableHead className="text-right font-semibold">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((document) => {
              const FileIcon = getFileIcon(document.name, document.attachment_type);
              return (
                <TableRow 
                  key={document.id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                  onClick={() => handleCardClick(document)}
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
                                {limitWords(document.name, 8)}
                              </p>
                            </TooltipTrigger>
                            {document.name.split(/\s+/).length > 8 && (
                              <TooltipContent>
                                <p className="max-w-xs">{document.name}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                        {document.description && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                                  {limitWords(document.description, 6)}
                                </p>
                              </TooltipTrigger>
                              {document.description.split(/\s+/).length > 6 && (
                                <TooltipContent>
                                  <p className="max-w-xs">{document.description}</p>
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
                      {COMPANY_DOCUMENT_TYPE_LABELS[document.document_type] || document.document_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {(document.job_roles && document.job_roles.length > 0) || 
                     (document.allowed_user_ids && document.allowed_user_ids.length > 0) ? (
                      <Badge 
                        variant="outline" 
                        className="text-xs border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400"
                      >
                        <Lock className="h-3 w-3 mr-1" />
                        Restrito
                      </Badge>
                    ) : (
                      <Badge 
                        variant="outline" 
                        className="text-xs border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                      >
                        <Users className="h-3 w-3 mr-1" />
                        Público
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-400">
                    {formatDistanceToNow(new Date(document.created_at), {
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </TableCell>
                  <TableCell>
                    {document.attachment_type === 'link' ? (
                      <Badge variant="outline" className="text-xs">
                        <Link className="h-3 w-3 mr-1" />
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
                          handleCardClick(document);
                        }}
                        disabled={!document.can_access && !isAdmin}
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {(canDeleteDocument(document) || canEditDocument(document)) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {canEditDocument(document) && onEdit && (
                              <>
                                <DropdownMenuItem onClick={() => onEdit(document)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                {canDeleteDocument(document) && <DropdownMenuSeparator />}
                              </>
                            )}
                            {canDeleteDocument(document) && (
                              <DropdownMenuItem 
                                onClick={() => onDelete(document)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
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
        onEdit={selectedDocument && canEditDocument(selectedDocument) && onEdit ? () => onEdit(selectedDocument) : undefined}
        canEdit={selectedDocument ? canEditDocument(selectedDocument) : false}
        isCompanyDocument={true}
      />
    </>
  );
};

