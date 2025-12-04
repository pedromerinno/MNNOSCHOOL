import React, { useState, useEffect, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HorizontalSettingsDialog, SettingsSection } from "@/components/ui/horizontal-settings-dialog";
import { CompanyDocumentType, COMPANY_DOCUMENT_TYPE_LABELS } from "@/types/company-document";
import { JobRole } from "@/types/job-roles";
import { useCompanies } from "@/hooks/useCompanies";
import { useJobRoles } from "@/hooks/job-roles/useJobRoles";
import { useCompanyUsers } from "@/hooks/company-documents/useCompanyUsers";
import { UserSelector } from "./UserSelector";
import { Upload, Link, Users, UserCheck, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { cn, suggestDocumentTitle } from "@/lib/utils";

interface CompanyDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (
    attachmentType: 'file' | 'link',
    fileOrUrl: File | string,
    documentType: CompanyDocumentType,
    description: string,
    name: string,
    selectedJobRoles: string[],
    selectedUsers: string[]
  ) => Promise<boolean>;
  isUploading: boolean;
  availableRoles: JobRole[];
}

export const CompanyDocumentDialog: React.FC<CompanyDocumentDialogProps> = ({
  open,
  onOpenChange,
  onUpload,
  isUploading,
  availableRoles: propAvailableRoles
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [documentType, setDocumentType] = useState<CompanyDocumentType>('other');
  const [attachmentType, setAttachmentType] = useState<'file' | 'link'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [accessType, setAccessType] = useState<'public' | 'roles' | 'users'>('public');
  
  const { selectedCompany } = useCompanies();
  const { users, isLoading: usersLoading } = useCompanyUsers();
  
  // Use job roles from the selected company
  const { jobRoles: dialogJobRoles } = useJobRoles(selectedCompany);
  
  // Use job roles from selected company, otherwise use prop roles
  const availableRoles = selectedCompany ? dialogJobRoles : propAvailableRoles;
  
  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setDocumentType('other');
    setAttachmentType('file');
    setFile(null);
    setLinkUrl('');
    setSelectedRoles([]);
    setSelectedUsers([]);
    setAccessType('public');
  };

  const handleSubmit = async () => {
    // Validações com feedback
    if (!selectedCompany?.id) {
      toast.error('Por favor, selecione uma empresa no menu superior primeiro');
      return;
    }
    
    if (!name.trim()) {
      toast.error('Por favor, informe o nome do documento');
      return;
    }
    
    if (attachmentType === 'file' && !file) {
      toast.error('Por favor, selecione um arquivo');
      return;
    }
    
    if (attachmentType === 'link' && !linkUrl.trim()) {
      toast.error('Por favor, informe a URL do link');
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

    const fileOrUrl = attachmentType === 'file' ? file! : linkUrl;
    const rolesToSubmit = accessType === 'roles' ? selectedRoles : [];
    const usersToSubmit = accessType === 'users' ? selectedUsers : [];
    
    const success = await onUpload(attachmentType, fileOrUrl, documentType, description, name, rolesToSubmit, usersToSubmit);
    
    if (success) {
      // Fechar popup imediatamente após sucesso
      resetForm();
      onOpenChange(false);
      
      // Disparar evento para atualizar a lista em background (se necessário)
      window.dispatchEvent(new CustomEvent('company-documents-updated'));
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!name) {
        const suggestedTitle = suggestDocumentTitle(selectedFile.name);
        setName(suggestedTitle);
      }
    }
  };

  const isFormValid = () => {
    if (!selectedCompany?.id) return false;
    if (!name.trim()) return false;
    if (attachmentType === 'file' && !file) return false;
    if (attachmentType === 'link' && !linkUrl.trim()) return false;
    if (accessType === 'roles' && selectedRoles.length === 0) return false;
    if (accessType === 'users' && selectedUsers.length === 0) return false;
    return true;
  };

  const sections: SettingsSection[] = useMemo(() => {
    // General Section Content
    const generalSectionContent = (
      <div className="space-y-8">
        {/* Company Info Warning */}
        {!selectedCompany && (
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-700 flex items-center gap-2">
              <span>⚠️</span>
              <span>Por favor, selecione uma empresa no menu superior primeiro</span>
            </p>
          </div>
        )}

        {/* Document Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-semibold text-gray-900">
            Nome do Documento
          </Label>
          <Input
            id="name"
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
          <Label htmlFor="description" className="text-sm font-semibold text-gray-900">
            Descrição
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva o conteúdo do documento..."
            rows={4}
            className="resize-none"
          />
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
                <Link className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-normal text-gray-700">Link</span>
              </div>
            </label>
          </div>
          {attachmentType === 'file' && (
            <div className="mt-4 space-y-2">
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
                  <span>Arquivo selecionado: {file.name}</span>
                </p>
              )}
            </div>
          )}
          {attachmentType === 'link' && (
            <div className="mt-4 space-y-2">
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
          )}
        </div>
      </div>
    );

    // Access & Scheduling Section Content
    const accessSectionContent = selectedCompany ? (
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
            {availableRoles.length > 0 ? (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Selecione os cargos:</Label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                  {availableRoles.map((role) => (
                    <div key={role.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`role-${role.id}`}
                        checked={selectedRoles.includes(role.id)}
                        onCheckedChange={(checked) => handleRoleToggle(role.id, checked === true)}
                      />
                      <Label htmlFor={`role-${role.id}`} className="text-sm font-normal cursor-pointer">
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
    ) : (
      <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
        <p className="text-sm text-orange-700 flex items-center gap-2">
          <span>⚠️</span>
          <span>Por favor, selecione uma empresa no menu superior primeiro</span>
        </p>
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
  }, [name, documentType, description, attachmentType, file, linkUrl, selectedCompany, accessType, selectedRoles, selectedUsers, availableRoles, users, usersLoading, companyColor, handleFileChange, handleRoleToggle, handleUserToggle]);

  return (
    <HorizontalSettingsDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Adicionar Documento da Empresa"
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
      isFormValid={isFormValid() && !!selectedCompany}
      saveButtonStyle={isFormValid() && selectedCompany ? { 
        backgroundColor: companyColor,
        borderColor: companyColor
      } : undefined}
    />
  );
};
