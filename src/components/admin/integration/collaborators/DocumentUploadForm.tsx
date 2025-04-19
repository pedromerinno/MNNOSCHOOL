
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DocumentType, DOCUMENT_TYPE_LABELS } from "@/types/document";
import { AlertCircle, Loader2, Upload } from "lucide-react";
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from '@/hooks/documents/constants';

interface DocumentUploadFormProps {
  onSubmit: (file: File, documentType: DocumentType, description: string) => Promise<void>;
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
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>("confidentiality_agreement");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      await onSubmit(file, documentType, description);
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
          disabled={isUploading || !file}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Enviar Documento
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
