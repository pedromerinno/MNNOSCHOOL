import React, { useState, useEffect, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { HorizontalSettingsDialog, SettingsSection } from "@/components/ui/horizontal-settings-dialog";
import { CompanyDocument, CompanyDocumentType, COMPANY_DOCUMENT_TYPE_LABELS } from "@/types/company-document";
import { JobRole } from "@/types/job-roles";
import { useJobRoles } from "@/hooks/job-roles/useJobRoles";
import { useCompanyUsers } from "@/hooks/company-documents/useCompanyUsers";
import { UserSelector } from "./UserSelector";
import { useCompanies } from "@/hooks/useCompanies";
import { Image as ImageIcon, X, FileText, Users, UserCheck } from 'lucide-react';
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateThumbnail } from "@/utils/thumbnailGenerator";

interface EditCompanyDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: CompanyDocument | null;
  onUpdate: (
    documentId: string,
    name: string,
    description: string,
    documentType: CompanyDocumentType,
    selectedJobRoles: string[],
    selectedUsers: string[],
    thumbnailPath?: string | null
  ) => Promise<boolean>;
  isUpdating: boolean;
}

export const EditCompanyDocumentDialog: React.FC<EditCompanyDocumentDialogProps> = ({
  open,
  onOpenChange,
  document,
  onUpdate,
  isUpdating
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [documentType, setDocumentType] = useState<CompanyDocumentType>('other');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [accessType, setAccessType] = useState<'public' | 'roles' | 'users'>('public');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailRemoved, setThumbnailRemoved] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);

  const { selectedCompany } = useCompanies();
  const { jobRoles } = useJobRoles(selectedCompany);
  const { users, isLoading: usersLoading } = useCompanyUsers();
  
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
      
      // Determinar tipo de acesso baseado nos dados do documento
      if (document.job_role_ids && document.job_role_ids.length > 0) {
        setAccessType('roles');
        setSelectedRoles(document.job_role_ids);
      } else if (document.allowed_user_ids && document.allowed_user_ids.length > 0) {
        setAccessType('users');
        setSelectedUsers(document.allowed_user_ids);
      } else {
        setAccessType('public');
        setSelectedRoles([]);
        setSelectedUsers([]);
      }
    }
  }, [document, open]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setDocumentType('other');
    setSelectedRoles([]);
    setSelectedUsers([]);
    setAccessType('public');
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
    if (!document || !name.trim()) {
      toast.error('Por favor, informe o nome do documento');
      return;
    }
    
    if (accessType === 'roles' && selectedRoles.length === 0) {
      toast.error('Por favor, selecione pelo menos um cargo');
      return;
    }
    
    if (accessType === 'users' && selectedUsers.length === 0) {
      toast.error('Por favor, selecione pelo menos um usuário');
      return;
    }
    
    setIsUploadingThumbnail(true);
    let newThumbnailPath: string | null | undefined = undefined;

    try {
      // Se um novo thumbnail foi selecionado, fazer upload
      if (thumbnailFile) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error('Usuário não autenticado');
          setIsUploadingThumbnail(false);
          return;
        }

        // Gerar thumbnail se necessário (para PDFs, etc)
        let fileToUpload = thumbnailFile;
        if (thumbnailFile.type === 'application/pdf' || document.file_path?.endsWith('.pdf')) {
          const generatedThumbnail = await generateThumbnail(thumbnailFile);
          if (generatedThumbnail) {
            fileToUpload = generatedThumbnail;
          }
        }

        // Deletar thumbnail antigo se existir
        if (document.thumbnail_path) {
          await supabase.storage
            .from('documents')
            .remove([document.thumbnail_path]);
        }

        // Upload do novo thumbnail
        const companyDir = `company-documents/${document.company_id}`;
        const thumbnailFileName = `thumb_${Date.now()}.jpg`;
        const thumbnailPath = `${companyDir}/thumbnails/${thumbnailFileName}`;

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
    
    const rolesToSubmit = accessType === 'roles' ? selectedRoles : [];
    const usersToSubmit = accessType === 'users' ? selectedUsers : [];
    
    const success = await onUpdate(
      document.id,
      name,
      description,
      documentType,
      rolesToSubmit,
      usersToSubmit,
      newThumbnailPath
    );
    
    if (success) {
      resetForm();
      onOpenChange(false);
    }
  };

  const handleRoleToggle = (roleId: string, checked: boolean) => {
    if (checked) {
      setSelectedRoles(prev => [...prev, roleId]);
    } else {
      setSelectedRoles(prev => prev.filter(id => id !== roleId));
    }
  };

  const handleUserToggle = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const isFormValid = () => {
    if (!name.trim()) return false;
    if (accessType === 'roles' && selectedRoles.length === 0) return false;
    if (accessType === 'users' && selectedUsers.length === 0) return false;
    return true;
  };

  const sections: SettingsSection[] = useMemo(() => {
    // General Section Content
    const generalSectionContent = (
      <div className="space-y-8">
        {/* Document Name */}
        <div className="space-y-2">
          <Label htmlFor="edit-name" className="text-sm font-semibold text-gray-900">
            Nome do Documento
          </Label>
          <Input
            id="edit-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Manual do Colaborador"
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
            onValueChange={(value) => setDocumentType(value as CompanyDocumentType)}
          >
            <SelectTrigger className="h-10 w-full">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <SelectValue placeholder="Escolha um tipo">
                  {COMPANY_DOCUMENT_TYPE_LABELS[documentType]}
                </SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(COMPANY_DOCUMENT_TYPE_LABELS).map(([key, label]) => (
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
          <Textarea
            id="edit-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva o conteúdo do documento..."
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

    // Access & Scheduling Section Content
    const accessSectionContent = (
      <div className="space-y-6">
        <div>
          <Label className="text-sm font-semibold text-gray-900">
            Controle de Acesso
          </Label>
          <p className="text-xs text-gray-500 mt-1">
            Defina quem pode acessar este documento
          </p>
        </div>

        <div className="space-y-2">
          {/* Public Access */}
          <label className={cn(
            "flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors",
            accessType === 'public' 
              ? "border-blue-500 bg-blue-50/50" 
              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          )}>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="accessType"
                  value="public"
                  checked={accessType === 'public'}
                  onChange={() => setAccessType('public')}
                  className="h-4 w-4 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                />
                <Label className="text-sm font-medium text-gray-900 cursor-pointer">
                  Acesso Público
                </Label>
              </div>
              <p className="text-xs text-gray-500 ml-7">
                Visível para todos os colaboradores da empresa
              </p>
            </div>
          </label>

          {/* Roles Access */}
          <label className={cn(
            "flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors",
            accessType === 'roles' 
              ? "border-blue-500 bg-blue-50/50" 
              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          )}>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="accessType"
                  value="roles"
                  checked={accessType === 'roles'}
                  onChange={() => setAccessType('roles')}
                  className="h-4 w-4 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                />
                <Label className="text-sm font-medium text-gray-900 flex items-center gap-2 cursor-pointer">
                  <UserCheck className="h-4 w-4" />
                  Acesso por Cargos
                </Label>
              </div>
              <p className="text-xs text-gray-500 ml-7">
                Restringir acesso a cargos específicos
              </p>
            </div>
          </label>
          {accessType === 'roles' && (
            <div className="ml-4 space-y-3 p-4 bg-gray-50 rounded-lg border">
              {jobRoles.length > 0 ? (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Selecione os cargos:</Label>
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                    {jobRoles.map((role) => (
                      <div key={role.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-role-${role.id}`}
                          checked={selectedRoles.includes(role.id)}
                          onCheckedChange={(checked) => handleRoleToggle(role.id, checked === true)}
                        />
                        <Label htmlFor={`edit-role-${role.id}`} className="text-sm font-normal cursor-pointer">
                          {role.title}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {selectedRoles.length === 0 && (
                    <p className="text-xs text-orange-600">
                      Selecione pelo menos um cargo
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-xs text-yellow-700">
                    Nenhum cargo disponível para esta empresa.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Users Access */}
          <label className={cn(
            "flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors",
            accessType === 'users' 
              ? "border-blue-500 bg-blue-50/50" 
              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          )}>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="accessType"
                  value="users"
                  checked={accessType === 'users'}
                  onChange={() => setAccessType('users')}
                  className="h-4 w-4 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                />
                <Label className="text-sm font-medium text-gray-900 flex items-center gap-2 cursor-pointer">
                  <Users className="h-4 w-4" />
                  Acesso por Usuários
                </Label>
              </div>
              <p className="text-xs text-gray-500 ml-7">
                Restringir acesso a usuários específicos
              </p>
            </div>
          </label>
          {accessType === 'users' && (
            <div className="ml-4 p-4 bg-gray-50 rounded-lg border">
              {usersLoading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin h-6 w-6 border-t-2 border-blue-500 border-r-2 rounded-full mx-auto mb-2"></div>
                  <p className="text-xs text-gray-500">Carregando usuários...</p>
                </div>
              ) : (
                <UserSelector
                  users={users}
                  selectedUsers={selectedUsers}
                  onUserToggle={handleUserToggle}
                  isPublic={false}
                  companyColor={companyColor}
                />
              )}
            </div>
          )}
        </div>
      </div>
    );

    return [
      {
        id: 'general',
        label: 'General',
        content: generalSectionContent
      },
      {
        id: 'access',
        label: 'Access & Scheduling',
        content: accessSectionContent
      }
    ];
  }, [name, documentType, description, thumbnailPreview, accessType, selectedRoles, selectedUsers, jobRoles, users, usersLoading, companyColor, isUploadingThumbnail]);

  if (!document) return null;

  return (
    <HorizontalSettingsDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Editar Documento da Empresa"
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
