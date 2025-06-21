import React from 'react';
import { CompanyDocument } from '@/types/company-document';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, Trash2, FileText, Link, Building, Users, Lock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCompanies } from "@/hooks/useCompanies";
import { useAuth } from "@/contexts/AuthContext";

interface CompanyDocumentListProps {
  documents: CompanyDocument[];
  onDownload: (document: CompanyDocument) => Promise<void>;
  onPreview: (document: CompanyDocument) => Promise<void>;
  onDelete: (document: CompanyDocument) => Promise<void>;
  canDeleteDocument: (document: CompanyDocument) => boolean;
  onAddDocument?: () => void;
}

export const CompanyDocumentList: React.FC<CompanyDocumentListProps> = ({
  documents,
  onDownload,
  onPreview,
  onDelete,
  canDeleteDocument
}) => {
  const { selectedCompany } = useCompanies();
  const { userProfile } = useAuth();
  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Building className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum documento encontrado</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Não há documentos da empresa nesta categoria.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((document) => (
        <Card key={document.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div 
                  className="p-2 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: `${companyColor}20` }}
                >
                  {document.attachment_type === 'link' ? (
                    <Link className="h-4 w-4" style={{ color: companyColor }} />
                  ) : (
                    <FileText className="h-4 w-4" style={{ color: companyColor }} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-sm line-clamp-2 mb-1">
                    {document.name}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(document.created_at), {
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </p>
                </div>
              </div>
              
              {canDeleteDocument(document) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-6 w-6 text-red-500 hover:text-red-700 flex-shrink-0"
                  onClick={() => onDelete(document)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>

            {document.description && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {document.description}
              </p>
            )}

            <div className="flex flex-wrap gap-1 mb-3">
              {/* Badge de visibilidade */}
              {document.job_roles && document.job_roles.length > 0 ? (
                <Badge variant="outline" className="text-xs">
                  <Lock className="h-3 w-3 mr-1" />
                  Restrito
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  Público
                </Badge>
              )}

              {/* Badge de acesso para admins */}
              {(userProfile?.is_admin || userProfile?.super_admin) && !document.can_access && (
                <Badge variant="destructive" className="text-xs">
                  Sem acesso
                </Badge>
              )}
            </div>

            {/* Mostrar cargos com acesso para admins */}
            {(userProfile?.is_admin || userProfile?.super_admin) && 
             document.job_roles && document.job_roles.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1">Cargos com acesso:</p>
                <div className="flex flex-wrap gap-1">
                  {document.job_roles.map((roleName, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {roleName}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onPreview(document)}
                disabled={!document.can_access && !userProfile?.is_admin && !userProfile?.super_admin}
              >
                <Eye className="h-3 w-3 mr-1" />
                Ver
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onDownload(document)}
                disabled={!document.can_access && !userProfile?.is_admin && !userProfile?.super_admin}
              >
                <Download className="h-3 w-3 mr-1" />
                Baixar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
