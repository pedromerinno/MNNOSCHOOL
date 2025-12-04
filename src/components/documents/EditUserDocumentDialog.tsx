import React, { useState, useEffect, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { HorizontalSettingsDialog, SettingsSection } from "@/components/ui/horizontal-settings-dialog";
import { UserDocument, DocumentType, DOCUMENT_TYPE_LABELS } from "@/types/document";
import { useCompanies } from "@/hooks/useCompanies";
import { Image as ImageIcon, X, FileText } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateThumbnail } from "@/utils/thumbnailGenerator";
import { useAuth } from "@/contexts/AuthContext";

interface EditUserDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: UserDocument | null;
  onUpdate: (
    documentId: string,
    name: string,
    description: string,
    documentType: DocumentType,
    thumbnailPath?: string | null
  ) => Promise<boolean>;
  isUpdating: boolean;
}

export const EditUserDocumentDialog: React.FC<EditUserDocumentDialogProps> = ({
  open,
  onOpenChange,
  document,
  onUpdate,
  isUpdating
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('other');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailRemoved, setThumbnailRemoved] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);

  const { selectedCompany } = useCompanies();
  const { user } = useAuth();
  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";

  // Preencher formulário quando documento é selecionado
  useEffect(() => {
    if (document && open) {
      setName(document.name);
      setDescription(document.description || '');
      setDocumentType(document.document_type);
      setThumbnailFile(null);
      setThumbnailPreview(null);
      setThumbnailRemoved(false);
      
      // Carregar preview do thumbnail existente
      if (document.thumbnail_path) {
        supabase.storage
          .from('documents')
          .createSignedUrl(document.thumbnail_path, 3600)
          .then(({ data, error }) => {
            if (!error && data) {
              setThumbnailPreview(data.signedUrl);
            }
          });
      }
    }
  }, [document, open]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setDocumentType('other');
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setThumbnailRemoved(false);
  };

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 2MB');
      return;
    }

    setThumbnailFile(file);
    setThumbnailRemoved(false);
    
    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setThumbnailPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setThumbnailRemoved(true);
  };

  const handleSubmit = async () => {
    if (!document || !name.trim() || !user) {
      toast.error('Por favor, informe o nome do documento');
      return;
    }
    
    setIsUploadingThumbnail(true);
    let newThumbnailPath: string | null | undefined = undefined;

    try {
      // Se um novo thumbnail foi selecionado, fazer upload
      if (thumbnailFile) {
        // Deletar thumbnail antigo se existir
        if (document.thumbnail_path) {
          await supabase.storage
            .from('documents')
            .remove([document.thumbnail_path]);
        }

        // Gerar thumbnail se necessário (para PDFs, etc)
        let fileToUpload = thumbnailFile;
        if (thumbnailFile.type === 'application/pdf' || document.file_path?.endsWith('.pdf')) {
          const generatedThumbnail = await generateThumbnail(thumbnailFile);
          if (generatedThumbnail) {
            fileToUpload = generatedThumbnail;
          }
        }

        // Upload do novo thumbnail
        const userDir = `user-documents/${user.id}`;
        const thumbnailFileName = `thumb_${Date.now()}.jpg`;
        const thumbnailPath = `${userDir}/thumbnails/${thumbnailFileName}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(thumbnailPath, fileToUpload, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Erro ao fazer upload do thumbnail:', uploadError);
          toast.error('Erro ao fazer upload do thumbnail');
        } else {
          newThumbnailPath = thumbnailPath;
        }
      } else if (thumbnailRemoved && document.thumbnail_path) {
        // Se o usuário removeu o thumbnail, marcar como null
        newThumbnailPath = null;
      }
    } catch (error) {
      console.error('Erro ao processar thumbnail:', error);
      toast.error('Erro ao processar thumbnail');
    } finally {
      setIsUploadingThumbnail(false);
    }
    
    const success = await onUpdate(
      document.id,
      name,
      description,
      documentType,
      newThumbnailPath
    );
    
    if (success) {
      resetForm();
      onOpenChange(false);
    }
  };

  const isFormValid = () => {
    return name.trim().length > 0;
  };

  const sections: SettingsSection[] = useMemo(() => {
    const generalSectionContent = (
      <div className="space-y-8">
        {/* Document Name */}
        <div className="space-y-2">
          <div>
            <Label htmlFor="edit-name" className="text-sm font-semibold text-gray-900">
              Nome do Documento
            </Label>
            <p className="text-xs text-gray-500 mt-1">
              Título que será exibido para este documento
            </p>
          </div>
          <Input
            id="edit-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Certificado de Conclusão"
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

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="edit-description" className="text-sm font-semibold text-gray-900">
            Descrição
          </Label>
          <p className="text-xs text-gray-500">
            Adicione informações sobre este documento (opcional)
          </p>
          <Textarea
            id="edit-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Adicione informações sobre este documento"
            rows={4}
            className="resize-none"
          />
        </div>

        {/* Thumbnail Upload */}
        <div className="space-y-2">
          <div>
            <Label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Thumbnail
            </Label>
            <p className="text-xs text-gray-500 mt-1">
              Selecione uma imagem para o thumbnail (máx. 2MB)
            </p>
          </div>
          <div className="space-y-3">
            {thumbnailPreview && (
              <div className="relative inline-block">
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={removeThumbnail}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            <Input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="cursor-pointer h-10"
              disabled={isUploadingThumbnail}
            />
          </div>
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
  }, [name, documentType, description, thumbnailPreview, isUploadingThumbnail]);

  if (!document) return null;

  return (
    <HorizontalSettingsDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Editar Documento"
      sections={sections}
      defaultSectionId="general"
      onCancel={() => {
        resetForm();
        onOpenChange(false);
      }}
      onSave={handleSubmit}
      saveLabel="Salvar Alterações"
      cancelLabel="Cancelar"
      isSaving={isUpdating || isUploadingThumbnail}
      isFormValid={isFormValid()}
      saveButtonStyle={isFormValid() ? { 
        backgroundColor: companyColor,
        borderColor: companyColor
      } : undefined}
    />
  );
};

