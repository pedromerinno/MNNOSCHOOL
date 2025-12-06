import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { HorizontalSettingsDialog, SettingsSection } from "@/components/ui/horizontal-settings-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DocumentType, DOCUMENT_TYPE_LABELS } from "@/types/document";
import { Upload, Link as LinkIcon, FileText, AlertCircle } from 'lucide-react';
import { cn, suggestDocumentTitle } from "@/lib/utils";
import { toast } from 'sonner';

interface DocumentUploadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (
    attachmentType: 'file' | 'link',
    fileOrUrl: File | string,
    documentType: DocumentType,
    description: string,
    name: string
  ) => Promise<boolean>;
  isUploading: boolean;
}

export const DocumentUploadForm = ({
  open,
  onOpenChange,
  onUpload,
  isUploading
}: DocumentUploadFormProps) => {
  const [attachmentType, setAttachmentType] = useState<'file' | 'link'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkName, setLinkName] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [documentType, setDocumentType] = useState<DocumentType>("confidentiality_agreement");
  const [description, setDescription] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setAttachmentType('file');
      setFile(null);
      setLinkUrl("");
      setLinkName("");
      setDocumentName("");
      setDocumentType("confidentiality_agreement");
      setDescription("");
      setFileError(null);
    }
  }, [open]);

  const resetForm = () => {
    setAttachmentType('file');
    setFile(null);
    setLinkUrl("");
    setLinkName("");
    setDocumentName("");
    setDocumentType("confidentiality_agreement");
    setDescription("");
    setFileError(null);
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (selectedFile.size > maxSize) {
        setFileError('O arquivo é muito grande. Tamanho máximo: 10MB');
        return;
      }
      setFile(selectedFile);
      setFileError(null);
      // Sugerir título baseado no nome do arquivo
      if (!documentName) {
        const suggestedTitle = suggestDocumentTitle(selectedFile.name);
        setDocumentName(suggestedTitle);
      }
    }
  }, [documentName]);

  const handleSubmit = async () => {
    setFileError(null);
    
    if (attachmentType === 'file' && !file) {
      toast.error('Por favor, selecione um arquivo');
      return;
    }
    
    if (attachmentType === 'link' && !linkUrl.trim()) {
      toast.error('Por favor, informe a URL do link');
      return;
    }

    if (!documentName.trim()) {
      toast.error('Por favor, informe o nome do documento');
      return;
    }

    const name = documentName.trim();
    const fileOrUrl = attachmentType === 'file' ? file! : linkUrl;
    
    const success = await onUpload(attachmentType, fileOrUrl, documentType, description, name);
    if (success) {
      resetForm();
      onOpenChange(false);
    }
  };

  const isFormValid = () => {
    if (!documentName.trim()) return false;
    if (attachmentType === 'file') {
      return file !== null;
    } else {
      return linkUrl.trim() !== '';
    }
  };

  const sections: SettingsSection[] = useMemo(() => {
    const generalSectionContent = (
      <div className="space-y-8">
        {fileError && (
          <div className="flex items-center text-red-500 bg-red-50 p-3 rounded-lg border border-red-200">
            <AlertCircle className="mr-2 h-4 w-4" />
            <span className="text-sm">{fileError}</span>
          </div>
        )}

        {/* Document Name */}
        <div className="space-y-2">
          <div>
            <Label htmlFor="documentName" className="text-sm font-semibold text-gray-900">
              Nome do Documento *
            </Label>
            <p className="text-xs text-gray-500 mt-1">
              Título que será exibido para este documento
            </p>
          </div>
          <Input
            id="documentName"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            placeholder={attachmentType === 'file' && file ? suggestDocumentTitle(file.name) : "Ex: Manual do Colaborador"}
            required
            className="h-10"
          />
        </div>

        {/* Document Type - Dropdown */}
        <div className="space-y-2">
          <div>
            <Label className="text-sm font-semibold text-gray-900">
              Tipo de Documento
            </Label>
            <p className="text-xs text-gray-500 mt-1">
              Selecione o tipo de documento que melhor descreve o conteúdo
            </p>
          </div>
          <Select
            value={documentType}
            onValueChange={(value) => setDocumentType(value as DocumentType)}
          >
            <SelectTrigger className="h-10 w-full">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <SelectValue placeholder="Escolha um tipo">
                  {DOCUMENT_TYPE_LABELS[documentType]}
                </SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DOCUMENT_TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Attachment Type - Radio Selection */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-semibold text-gray-900">
              Tipo de Anexo
            </Label>
            <p className="text-xs text-gray-500 mt-1">
              Escolha como o documento será anexado
            </p>
          </div>
          <div className="space-y-2">
            <label className={cn(
              "flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors",
              attachmentType === 'file' 
                ? "border-blue-500 bg-blue-50/50" 
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            )}>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="attachmentType"
                  value="file"
                  checked={attachmentType === 'file'}
                  onChange={() => setAttachmentType('file')}
                  className="h-4 w-4 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                />
                <Upload className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-normal text-gray-700">Arquivo</span>
              </div>
            </label>
            <label className={cn(
              "flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors",
              attachmentType === 'link' 
                ? "border-blue-500 bg-blue-50/50" 
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            )}>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="attachmentType"
                  value="link"
                  checked={attachmentType === 'link'}
                  onChange={() => setAttachmentType('link')}
                  className="h-4 w-4 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                />
                <LinkIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-normal text-gray-700">Link</span>
              </div>
            </label>
          </div>
          
          {attachmentType === 'file' && (
            <div className="mt-4 space-y-2">
              <Label htmlFor="file" className="text-sm font-semibold text-gray-900">
                Arquivo
              </Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                required
                className="h-10 cursor-pointer"
              />
              {file && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <span>✓</span>
                  <span>Arquivo selecionado: {file.name} ({Math.round(file.size / 1024)} KB)</span>
                </p>
              )}
            </div>
          )}
          
          {attachmentType === 'link' && (
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="linkName" className="text-sm font-semibold text-gray-900">
                  Nome do Link
                </Label>
                <Input
                  id="linkName"
                  value={linkName}
                  onChange={(e) => {
                    setLinkName(e.target.value);
                    if (!documentName) {
                      setDocumentName(e.target.value);
                    }
                  }}
                  placeholder="Ex: Documentação Oficial"
                  required
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkUrl" className="text-sm font-semibold text-gray-900">
                  URL do Link
                </Label>
                <Input
                  id="linkUrl"
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://exemplo.com/documento"
                  required
                  className="h-10"
                />
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-semibold text-gray-900">
            Descrição
          </Label>
          <p className="text-xs text-gray-500">
            Adicione informações sobre este documento (opcional)
          </p>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Adicione informações sobre este documento"
            rows={4}
            className="resize-none"
          />
        </div>
      </div>
    );

    return [
      {
        id: 'general',
        label: 'General',
        content: generalSectionContent
      }
    ];
  }, [attachmentType, file, linkUrl, linkName, documentName, documentType, description, fileError, handleFileChange]);

  return (
    <HorizontalSettingsDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Adicionar Documento"
      sections={sections}
      defaultSectionId="general"
      onCancel={() => {
        resetForm();
        onOpenChange(false);
      }}
      onSave={handleSubmit}
      saveLabel="Save"
      cancelLabel="Cancel"
      isSaving={isUploading}
      isFormValid={isFormValid()}
    />
  );
};
