
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentType, DOCUMENT_TYPE_LABELS } from "@/types/document";
import { AlertCircle, Loader2, Upload, Link as LinkIcon } from "lucide-react";

interface DocumentUploadFormProps {
  onSubmit: (
    attachmentType: 'file' | 'link',
    fileOrUrl: File | string,
    documentType: DocumentType,
    description: string,
    name: string
  ) => Promise<void>;
  isUploading: boolean;
  fileError: string | null;
  onCancel: () => void;
}

export const DocumentUploadForm: React.FC<DocumentUploadFormProps> = ({
  onSubmit,
  isUploading,
  fileError,
  onCancel
}) => {
  const [attachmentType, setAttachmentType] = useState<'file' | 'link'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkName, setLinkName] = useState("");
  const [documentType, setDocumentType] = useState<DocumentType>("confidentiality_agreement");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (attachmentType === 'file' && file) {
      await onSubmit(attachmentType, file, documentType, description, file.name);
    } else if (attachmentType === 'link' && linkUrl && linkName) {
      await onSubmit(attachmentType, linkUrl, documentType, description, linkName);
    }
  };

  const isValid = () => {
    if (attachmentType === 'file') {
      return file !== null;
    } else {
      return linkUrl.trim() !== '' && linkName.trim() !== '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fileError && (
        <div className="flex items-center text-red-500 bg-red-50 p-2 rounded">
          <AlertCircle className="mr-2 h-4 w-4" />
          <span>{fileError}</span>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="document-type">Tipo de Documento</Label>
        <Select 
          value={documentType} 
          onValueChange={(value) => setDocumentType(value as DocumentType)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo de documento" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Tipo de Anexo</Label>
        <Tabs value={attachmentType} onValueChange={(value) => setAttachmentType(value as 'file' | 'link')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Arquivo
            </TabsTrigger>
            <TabsTrigger value="link" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Link
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="file" className="space-y-2">
            <Label htmlFor="document-file">Arquivo</Label>
            <Input 
              id="document-file" 
              type="file" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            {file && (
              <p className="text-sm text-gray-500">
                Arquivo selecionado: {file.name} ({Math.round(file.size / 1024)} KB)
              </p>
            )}
          </TabsContent>
          
          <TabsContent value="link" className="space-y-2">
            <div className="space-y-2">
              <Label htmlFor="document-name">Nome do Documento</Label>
              <Input 
                id="document-name"
                value={linkName}
                onChange={(e) => setLinkName(e.target.value)}
                placeholder="Digite o nome do documento"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="document-url">URL do Link</Label>
              <Input 
                id="document-url"
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://exemplo.com/documento"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="document-description">Descrição (opcional)</Label>
        <Textarea 
          id="document-description" 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Adicione informações sobre este documento"
          rows={3}
        />
      </div>
      
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={isUploading || !isValid()}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              {attachmentType === 'file' ? (
                <Upload className="mr-2 h-4 w-4" />
              ) : (
                <LinkIcon className="mr-2 h-4 w-4" />
              )}
              {attachmentType === 'file' ? 'Enviar Documento' : 'Adicionar Link'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
