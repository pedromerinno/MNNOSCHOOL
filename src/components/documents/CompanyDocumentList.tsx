
import React, { useState, useEffect } from 'react';
import { CompanyDocument } from '@/types/company-document';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Download, Eye, Trash2, FileText, Link, Building, Users, Lock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCompanies } from "@/hooks/useCompanies";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/company/useIsAdmin";
import { DocumentDetailsDialog } from './DocumentDetailsDialog';
import { supabase } from "@/integrations/supabase/client";

/**
 * Função para obter o ícone apropriado baseado no tipo de arquivo
 */
const getFileIcon = (fileName?: string, attachmentType?: 'file' | 'link') => {
  if (attachmentType === 'link') {
    return Link;
  }

  if (!fileName) return FileText;

  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return FileText;
    case 'doc':
    case 'docx':
      return FileText;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return FileText;
    default:
      return FileText;
  }
};

interface CompanyDocumentListProps {
  documents: CompanyDocument[];
  onDownload: (document: CompanyDocument) => Promise<void>;
  onPreview: (document: CompanyDocument) => Promise<void>;
  onDelete: (document: CompanyDocument) => Promise<void>;
  onEdit?: (document: CompanyDocument) => void;
  canDeleteDocument: (document: CompanyDocument) => boolean;
  onAddDocument?: () => void;
}

export const CompanyDocumentList: React.FC<CompanyDocumentListProps> = ({
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

  // Função para converter cor para rgba com opacidade
  const colorToRgba = (color: string, opacity: number): string => {
    const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbaMatch) {
      return `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, ${opacity})`;
    }
    
    const hexMatch = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    if (hexMatch) {
      const r = parseInt(hexMatch[1], 16);
      const g = parseInt(hexMatch[2], 16);
      const b = parseInt(hexMatch[3], 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    
    const hexShortMatch = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(color);
    if (hexShortMatch) {
      const r = parseInt(hexShortMatch[1] + hexShortMatch[1], 16);
      const g = parseInt(hexShortMatch[2] + hexShortMatch[2], 16);
      const b = parseInt(hexShortMatch[3] + hexShortMatch[3], 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    
    return color;
  };

  // Componente para renderizar thumbnail do documento
  const DocumentThumbnail = ({ document }: { document: CompanyDocument }) => {
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const FileIcon = getFileIcon(document.name, document.attachment_type);
    const extension = document.name.split('.').pop()?.toLowerCase();

    useEffect(() => {
      const loadThumbnail = async () => {
        if (document.attachment_type === 'link') {
          return;
        }

        // Se tiver thumbnail_path, usar ele
        if (document.thumbnail_path) {
          setIsLoading(true);
          try {
            const { data, error } = await supabase.storage
              .from('documents')
              .createSignedUrl(document.thumbnail_path, 3600);
            
            if (!error && data) {
              setThumbnailUrl(data.signedUrl);
            }
          } catch (error) {
            console.error('Error loading thumbnail:', error);
          } finally {
            setIsLoading(false);
          }
          return;
        }

        // Fallback: tentar carregar o arquivo original se não tiver thumbnail
        if (!document.file_path) {
          return;
        }
        
        // Para imagens, tentar carregar diretamente
        if (extension && ['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
          setIsLoading(true);
          try {
            const { data, error } = await supabase.storage
              .from('documents')
              .createSignedUrl(document.file_path, 3600);
            
            if (!error && data) {
              setThumbnailUrl(data.signedUrl);
            }
          } catch (error) {
            console.error('Error loading image thumbnail:', error);
          } finally {
            setIsLoading(false);
          }
        }
      };

      loadThumbnail();
    }, [document.thumbnail_path, document.file_path, document.attachment_type, document.name]);

    if (document.attachment_type === 'link') {
      const backgroundBlurColor = companyColor 
        ? colorToRgba(companyColor, 0.08)
        : undefined;

      return (
        <div 
          className="w-full h-32 rounded-xl flex items-center justify-center relative overflow-hidden"
          style={backgroundBlurColor ? {
            backgroundColor: backgroundBlurColor,
          } : {
            backgroundColor: 'rgba(243, 244, 246, 0.5)',
          }}
        >
          <div className="text-center z-10">
            <Link className="h-10 w-10 mx-auto" style={{ color: companyColor }} />
          </div>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <div className="animate-spin h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full" />
        </div>
      );
    }

    if (thumbnailUrl) {
      return (
        <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <img
            src={thumbnailUrl}
            alt={document.name}
            className="w-full h-full object-cover"
            onError={() => setThumbnailUrl(null)}
          />
        </div>
      );
    }

    // Fallback: ícone estilizado com estilo dos cards de valores
    const backgroundBlurColor = companyColor 
      ? colorToRgba(companyColor, 0.08)
      : undefined;

    return (
      <div 
        className="w-full h-32 rounded-xl flex items-center justify-center relative overflow-hidden"
        style={backgroundBlurColor ? {
          backgroundColor: backgroundBlurColor,
        } : {
          backgroundColor: 'rgba(243, 244, 246, 0.5)',
        }}
      >
        <div className="text-center z-10">
          <div 
            className="rounded-full flex items-center justify-center mx-auto"
            style={{ 
              color: companyColor,
            }}
          >
            <FileIcon className="h-10 w-10" style={{ color: companyColor }} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {documents.map((document) => {
          const FileIcon = getFileIcon(document.name, document.attachment_type);
          return (
            <Card 
              key={document.id} 
              className="group relative overflow-hidden border border-gray-200/60 dark:border-gray-800/60 bg-white dark:bg-[#222222] hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 transition-all duration-300 cursor-pointer flex flex-col"
              onClick={() => handleCardClick(document)}
            >
              {/* Thumbnail/Preview no topo */}
              <div className="w-full overflow-hidden bg-gray-50 dark:bg-gray-800">
                <DocumentThumbnail document={document} />
              </div>

              <CardContent className="p-3 flex-1 flex flex-col">
                {/* Título */}
                <div className="mb-2">
                  <h4 className="font-semibold text-sm mb-0.5 text-gray-900 dark:text-white line-clamp-2">
                    {document.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(document.created_at), {
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </p>
                </div>

                {/* Descrição */}
                {document.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2 leading-relaxed">
                    {document.description}
                  </p>
                )}

                {/* Badge de acesso */}
                <div className="mb-2">
                  {(document.job_roles && document.job_roles.length > 0) || 
                   (document.allowed_user_ids && document.allowed_user_ids.length > 0) ? (
                    <Badge 
                      variant="outline" 
                      className="text-xs px-1.5 py-0.5 border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400"
                    >
                      <Lock className="h-3 w-3 mr-1" />
                      Restrito
                    </Badge>
                  ) : (
                    <Badge 
                      variant="outline" 
                      className="text-xs px-1.5 py-0.5 border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                    >
                      <Users className="h-3 w-3 mr-1" />
                      Público
                    </Badge>
                  )}
                </div>

                {/* Botões de ação */}
                <div className="mt-auto pt-2 border-t border-gray-100 dark:border-gray-800 flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick(document);
                    }}
                    disabled={!document.can_access && !isAdmin}
                  >
                    <Eye className="h-3 w-3 mr-1.5" />
                    Ver Detalhes
                  </Button>
                  {canDeleteDocument(document) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="px-3 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-800 transition-colors text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(document);
                      }}
                      title="Excluir documento"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
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
