
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Trash2, Upload } from "lucide-react";
import { UserDocument, DOCUMENT_TYPE_LABELS } from "@/types/document";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

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
  onUploadClick
}) => {
  const handleDownload = async (document: UserDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path);
        
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      // Use window.document instead of the parameter named 'document'
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.name;
      a.click();
      URL.revokeObjectURL(url);
      
    } catch (error: any) {
      console.error('Error downloading document:', error);
      toast.error(`Erro ao baixar documento: ${error.message}`);
    }
  };

  const confirmDelete = async (document: UserDocument) => {
    if (confirm(`Tem certeza que deseja excluir o documento "${document.name}"?`)) {
      await onDelete(document.id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-20 flex items-center justify-center">
              <span className="text-gray-400">Carregando...</span>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
        <h3 className="text-lg font-medium mb-2">Nenhum documento</h3>
        <p className="text-gray-500 mb-4">
          Este colaborador não possui documentos cadastrados.
        </p>
        <Button onClick={onUploadClick}>
          <Upload className="mr-2 h-4 w-4" />
          Adicionar Documento
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Documentos do Colaborador</h3>
        <Button onClick={onUploadClick} size="sm">
          <Upload className="mr-2 h-4 w-4" />
          Adicionar
        </Button>
      </div>
      
      {documents.map(document => (
        <Card key={document.id} className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full mr-3">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">{document.name}</p>
                  <div className="flex text-sm text-gray-500 space-x-2">
                    <span>{DOCUMENT_TYPE_LABELS[document.document_type] || document.document_type}</span>
                    <span>•</span>
                    <span>{format(new Date(document.uploaded_at), 'dd/MM/yyyy')}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => handleDownload(document)}
                  title="Baixar documento"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => confirmDelete(document)}
                  title="Excluir documento"
                  className="text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
