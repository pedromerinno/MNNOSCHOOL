import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { FileText, Download, Link as LinkIcon, ExternalLink, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CompanyDocument } from '@/types/company-document';
import { UserDocument, DOCUMENT_TYPE_LABELS } from '@/types/document';
import { COMPANY_DOCUMENT_TYPE_LABELS } from '@/types/company-document';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { PDFViewer } from './PDFViewer';

interface DocumentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: CompanyDocument | UserDocument | null;
  companyColor?: string;
  onPreview?: () => void;
  onDownload?: () => void;
  onEdit?: () => void;
  isCompanyDocument?: boolean;
  canEdit?: boolean;
}

/**
 * Função para obter o ícone apropriado baseado no tipo de arquivo
 */
const getFileIcon = (fileName?: string, attachmentType?: 'file' | 'link') => {
  if (attachmentType === 'link') {
    return LinkIcon;
  }

  if (!fileName) return FileText;

  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return FileText; // Poderia usar um ícone específico de PDF se tiver
    case 'doc':
    case 'docx':
      return FileText; // Poderia usar um ícone específico de Word
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return FileText; // Poderia usar um ícone de imagem
    default:
      return FileText;
  }
};

export const DocumentDetailsDialog: React.FC<DocumentDetailsDialogProps> = ({
  open,
  onOpenChange,
  document,
  companyColor = "#1EAEDB",
  onPreview,
  onDownload,
  onEdit,
  isCompanyDocument = false,
  canEdit = false
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [authorName, setAuthorName] = useState<string | null>(null);

  const loadAuthorName = useCallback(async () => {
    if (!document) return;
    
    try {
      const authorId = isCompanyDocument 
        ? (document as CompanyDocument).created_by 
        : (document as UserDocument).uploaded_by;
      
      if (!authorId) {
        setAuthorName(null);
        return;
      }

      // Buscar nome do usuário na tabela de perfis
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', authorId)
        .single();

      if (error) {
        console.error('Error loading author name:', error);
        setAuthorName(null);
        return;
      }

      setAuthorName(data?.display_name || null);
    } catch (error) {
      console.error('Error loading author name:', error);
      setAuthorName(null);
    }
  }, [document, isCompanyDocument]);

  const loadPreviewUrl = useCallback(async () => {
    if (!document) return;
    
    if (document.attachment_type === 'link' && 'link_url' in document && document.link_url) {
      return;
    }

    if (document.file_path) {
      setIsLoadingPreview(true);
      try {
        const { data, error } = await supabase.storage
          .from('documents')
          .createSignedUrl(document.file_path, 3600);

        if (error) {
          throw error;
        }

        setPreviewUrl(data.signedUrl);
      } catch (error: any) {
        console.error('Error creating preview URL:', error);
        toast.error('Erro ao carregar arquivo');
      } finally {
        setIsLoadingPreview(false);
      }
    }
  }, [document]);

  useEffect(() => {
    if (open && document) {
      // Carregar URL do preview automaticamente
      if (document.file_path && (document.attachment_type === 'file' || !document.attachment_type)) {
        loadPreviewUrl();
      }
      // Carregar nome do autor
      loadAuthorName();
    } else if (!open) {
      setPreviewUrl(null);
      setAuthorName(null);
    }
  }, [open, document, loadPreviewUrl, loadAuthorName]);

  if (!document) return null;

  const isPDF = document.file_path?.toLowerCase().endsWith('.pdf') || document.name?.toLowerCase().endsWith('.pdf');
  const FileIcon = getFileIcon(document.name, document.attachment_type);
  const documentTypeLabels = isCompanyDocument ? COMPANY_DOCUMENT_TYPE_LABELS : DOCUMENT_TYPE_LABELS;
  const documentType = document.document_type as any;

  const handleDownload = async () => {
    if (onDownload) {
      await onDownload();
    } else if (document.attachment_type === 'link' && 'link_url' in document && document.link_url) {
      window.open(document.link_url, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[90vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            <div 
              className="p-2.5 rounded-lg"
              style={{ 
                backgroundColor: `${companyColor}15`,
              }}
            >
              <FileIcon className="h-5 w-5" style={{ color: companyColor }} />
            </div>
            <DialogTitle className="text-xl font-semibold flex-1">
              {document.name}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Preview Area - Left Side */}
          {previewUrl && (document.attachment_type === 'file' || !document.attachment_type) ? (
            <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col bg-gray-50 dark:bg-gray-900">
              {isLoadingPreview ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">Carregando documento...</p>
                  </div>
                </div>
              ) : isPDF && previewUrl ? (
                <PDFViewer
                  url={previewUrl}
                  fileName={document.name}
                  onDownload={handleDownload}
                />
              ) : previewUrl ? (
                <div className="h-full p-4 overflow-auto">
                  <iframe
                    src={previewUrl}
                    className="w-full h-full border rounded-lg min-h-[500px]"
                    title="Document preview"
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          {/* Information Area - Right Side */}
          <div className={`overflow-y-auto bg-white dark:bg-gray-800 flex flex-col ${previewUrl && (document.attachment_type === 'file' || !document.attachment_type) ? 'w-1/2' : 'w-full'}`}>
            <div className="p-8 space-y-6 flex-1">
              {/* Informações principais */}
              <div className="space-y-6">
                {/* Nome */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Nome
                  </Label>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {document.name}
                  </p>
                </div>

                {/* Tipo */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Tipo
                  </Label>
                  <Badge variant="secondary" className="text-sm">
                    {documentTypeLabels[documentType] || documentType}
                  </Badge>
                </div>

                {/* Data */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Data
                  </Label>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {format(
                      new Date(isCompanyDocument ? (document as CompanyDocument).created_at : (document as UserDocument).uploaded_at),
                      "dd 'de' MMMM 'de' yyyy",
                      { locale: ptBR }
                    )}
                  </p>
                </div>

                {/* Hora */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Hora
                  </Label>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {format(
                      new Date(isCompanyDocument ? (document as CompanyDocument).created_at : (document as UserDocument).uploaded_at),
                      "HH:mm",
                      { locale: ptBR }
                    )}
                  </p>
                </div>

                {/* Formato */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Formato
                  </Label>
                  <Badge variant="outline" className="text-sm">
                    {document.attachment_type === 'link' ? 'Link Externo' : 'Arquivo'}
                  </Badge>
                </div>

                {/* Autor */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Autor
                  </Label>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {authorName || 'Carregando...'}
                  </p>
                </div>

                {/* Link (apenas se for link externo) */}
                {document.attachment_type === 'link' && 'link_url' in document && document.link_url && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Link
                    </Label>
                    <a
                      href={document.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
                    >
                      {document.link_url}
                    </a>
                  </div>
                )}

                {/* Visibilidade (apenas para documentos da empresa) */}
                {isCompanyDocument && (document as CompanyDocument) && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Visibilidade
                    </Label>
                    <div className="space-y-2">
                      {(() => {
                        const companyDoc = document as CompanyDocument;
                        const hasRoleRestrictions = companyDoc.job_role_ids && companyDoc.job_role_ids.length > 0;
                        const hasUserRestrictions = companyDoc.allowed_user_ids && companyDoc.allowed_user_ids.length > 0;
                        
                        if (!hasRoleRestrictions && !hasUserRestrictions) {
                          return (
                            <Badge variant="secondary" className="text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Público - Todos os colaboradores
                            </Badge>
                          );
                        }
                        
                        return (
                          <div className="space-y-2">
                            {hasRoleRestrictions && (
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Restrito a cargos:</p>
                                <div className="flex flex-wrap gap-1">
                                  {companyDoc.job_roles && companyDoc.job_roles.length > 0 ? (
                                    companyDoc.job_roles.map((role, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {role}
                                      </Badge>
                                    ))
                                  ) : (
                                    <Badge variant="outline" className="text-xs">
                                      {companyDoc.job_role_ids?.length || 0} cargo(s)
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                            {hasUserRestrictions && (
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Restrito a usuários:</p>
                                <div className="flex flex-wrap gap-1">
                                  {companyDoc.allowed_users && companyDoc.allowed_users.length > 0 ? (
                                    companyDoc.allowed_users.map((user, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {user}
                                      </Badge>
                                    ))
                                  ) : (
                                    <Badge variant="outline" className="text-xs">
                                      {companyDoc.allowed_user_ids?.length || 0} usuário(s)
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer with buttons */}
            <div className="border-t px-6 py-4 flex justify-end items-center gap-3 bg-white dark:bg-gray-800 flex-shrink-0">
              {canEdit && onEdit && (
                <Button
                  variant="outline"
                  onClick={onEdit}
                  className="min-w-[100px]"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
              {document.attachment_type === 'link' ? (
                <Button
                  onClick={handleDownload}
                  className="min-w-[100px]"
                  style={{ backgroundColor: companyColor, color: 'white' }}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir Link
                </Button>
              ) : (
                <Button
                  onClick={handleDownload}
                  className="min-w-[100px]"
                  style={{ backgroundColor: companyColor, color: 'white' }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

