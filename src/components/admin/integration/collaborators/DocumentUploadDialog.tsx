
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DocumentType, DOCUMENT_TYPE_LABELS } from "@/types/document";
import { toast } from "sonner";
import { Loader2, Upload, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  companyId: string;
  onUploadComplete: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'application/pdf', 
  'application/msword', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
  'image/jpeg', 
  'image/png'
];

export const DocumentUploadDialog: React.FC<DocumentUploadDialogProps> = ({
  open,
  onOpenChange,
  userId,
  companyId,
  onUploadComplete
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>("confidentiality_agreement");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const resetForm = () => {
    setFile(null);
    setDocumentType("confidentiality_agreement");
    setDescription("");
    setFileError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setFileError("O arquivo não pode ser maior que 10MB");
      return;
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
      setFileError("Tipo de arquivo não permitido. Use PDF, DOC, DOCX, JPG ou PNG.");
      return;
    }

    setFile(selectedFile);
    setFileError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setFileError("Por favor, selecione um arquivo");
      return;
    }

    setIsUploading(true);
    setFileError(null);

    try {
      const userDir = `user-documents/${userId}`;
      const fileExt = file.name.split('.').pop();
      const fileName = `${userDir}/${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { error } = await supabase
        .from('user_documents')
        .insert({
          user_id: userId,
          company_id: companyId,
          name: file.name,
          file_path: filePath,
          file_type: file.type,
          document_type: documentType,
          description: description || null,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id || userId
        });

      if (error) throw error;

      toast.success('Documento enviado com sucesso');
      resetForm();
      onOpenChange(false);
      onUploadComplete();
    } catch (error: any) {
      console.error('Erro no upload do documento:', error);
      toast.error(`Erro: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload de Documento</DialogTitle>
          <DialogDescription>
            Faça upload de um documento para o colaborador
          </DialogDescription>
        </DialogHeader>
        
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
              onChange={handleFileChange}
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
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
