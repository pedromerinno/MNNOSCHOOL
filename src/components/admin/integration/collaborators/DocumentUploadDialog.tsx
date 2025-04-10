
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DocumentType, DOCUMENT_TYPE_LABELS } from "@/types/document";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  companyId: string;
  onUploadComplete: () => void;
}

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
  const [bucketsReady, setBucketsReady] = useState(false);
  const [bucketError, setBucketError] = useState<string | null>(null);

  // Verificar se o bucket documents existe
  useEffect(() => {
    if (!open) return;

    const checkBucket = async () => {
      try {
        setBucketError(null);
        console.log("Verificando bucket de documentos...");
        
        const { data: buckets, error } = await supabase.storage.listBuckets();
        
        if (error) {
          console.error("Erro ao verificar buckets:", error);
          setBucketError(`Erro ao verificar buckets: ${error.message}`);
          return;
        }
        
        // Verificar se o bucket documents existe
        const documentsBucket = buckets?.find(b => b.name === 'documents');
        
        if (!documentsBucket) {
          console.error("Bucket 'documents' não encontrado. Verifique se ele foi criado no Supabase.");
          setBucketError(`Bucket 'documents' não encontrado. Contate o administrador.`);
          return;
        }
        
        console.log("Bucket de documentos encontrado e pronto para uso.");
        setBucketsReady(true);
      } catch (error: any) {
        console.error("Erro ao verificar buckets:", error);
        setBucketError(`Erro ao verificar armazenamento: ${error.message}`);
        toast.error("Erro ao verificar armazenamento. Tente novamente mais tarde.");
      }
    };

    checkBucket();
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error("O tamanho máximo do arquivo é 10MB");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Por favor, selecione um arquivo");
      return;
    }

    if (!bucketsReady) {
      toast.error("Sistema de armazenamento não está pronto. Aguarde um momento.");
      return;
    }

    setIsUploading(true);
    try {
      // Ensure the user-specific directory exists in the documents bucket
      const userDir = `user-documents/${userId}`;
      
      // 1. Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userDir}/${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      // 2. Create database record
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
      onUploadComplete();
      onOpenChange(false);
      
      // Reset form
      setFile(null);
      setDescription("");
      setDocumentType("confidentiality_agreement");
    } catch (error: any) {
      console.error('Error uploading document:', error);
      if (error.message.includes("already exists")) {
        toast.error("Um arquivo com este nome já existe. Tente novamente com outro arquivo.");
      } else if (error.message.includes("storage/bucket-not-found")) {
        toast.error("Armazenamento não configurado. Por favor, entre em contato com o administrador.");
        setBucketsReady(false);
        setBucketError("Bucket 'documents' não encontrado");
      } else {
        toast.error(`Erro no upload: ${error.message}`);
      }
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
            Faça upload de documentos para o colaborador
          </DialogDescription>
        </DialogHeader>
        
        {bucketError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            <p className="text-sm font-medium">Erro no sistema de armazenamento</p>
            <p className="text-xs mt-1">{bucketError}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!file || isUploading || !bucketsReady}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : !bucketsReady ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Preparando...
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
