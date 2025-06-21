import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CompanyDocumentType, COMPANY_DOCUMENT_TYPE_LABELS } from "@/types/company-document";
import { JobRole } from "@/types/job-roles";
import { useCompanies } from "@/hooks/useCompanies";
import { useJobRoles } from "@/hooks/job-roles/useJobRoles";
import { useCompanyUsers } from "@/hooks/company-documents/useCompanyUsers";
import { UserSelector } from "./UserSelector";
import { CompanySelector } from "@/components/admin/integration/CompanySelector";
import { Building, Upload, Link, Users, UserCheck, Tag } from 'lucide-react';

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
  const [selectedCompanyForDialog, setSelectedCompanyForDialog] = useState<string>('');
  
  const { userCompanies, selectedCompany } = useCompanies();
  const { users, isLoading: usersLoading } = useCompanyUsers();

  // Get the company object from the selected ID
  const dialogCompany = userCompanies.find(c => c.id === selectedCompanyForDialog) || selectedCompany;
  
  // Use job roles from the selected company in dialog
  const { jobRoles: dialogJobRoles } = useJobRoles(dialogCompany);
  
  // Use dialog job roles if we have a selected company, otherwise use prop roles
  const availableRoles = selectedCompanyForDialog ? dialogJobRoles : propAvailableRoles;
  
  const companyColor = dialogCompany?.cor_principal || "#1EAEDB";

  // Initialize with selected company if available
  useEffect(() => {
    if (open && selectedCompany && !selectedCompanyForDialog) {
      setSelectedCompanyForDialog(selectedCompany.id);
    }
  }, [open, selectedCompany, selectedCompanyForDialog]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    if (attachmentType === 'file' && !file) return;
    if (attachmentType === 'link' && !linkUrl.trim()) return;
    if (accessType === 'roles' && selectedRoles.length === 0) return;
    if (accessType === 'users' && selectedUsers.length === 0) return;

    const fileOrUrl = attachmentType === 'file' ? file! : linkUrl;
    const rolesToSubmit = accessType === 'roles' ? selectedRoles : [];
    const usersToSubmit = accessType === 'users' ? selectedUsers : [];
    
    const success = await onUpload(attachmentType, fileOrUrl, documentType, description, name, rolesToSubmit, usersToSubmit);
    
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!name) {
        setName(selectedFile.name);
      }
    }
  };

  const isFormValid = () => {
    if (!name.trim()) return false;
    if (attachmentType === 'file' && !file) return false;
    if (attachmentType === 'link' && !linkUrl.trim()) return false;
    if (accessType === 'roles' && selectedRoles.length === 0) return false;
    if (accessType === 'users' && selectedUsers.length === 0) return false;
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" style={{ color: companyColor }} />
            Adicionar Documento da Empresa
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Selector */}
          <div className="space-y-2">
            <Label>Empresa</Label>
            <CompanySelector
              companies={userCompanies}
              selectedCompany={dialogCompany}
              onCompanyChange={setSelectedCompanyForDialog}
              disabled={isUploading}
            />
            {!selectedCompanyForDialog && (
              <p className="text-sm text-orange-600">
                Selecione uma empresa primeiro
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Documento *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Manual do Colaborador"
                required
              />
            </div>
            
            {/* Document Type Tags */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tipo de Documento
              </Label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(COMPANY_DOCUMENT_TYPE_LABELS).map(([key, label]) => (
                  <Badge
                    key={key}
                    variant={documentType === key ? "default" : "outline"}
                    className={`cursor-pointer transition-colors hover:opacity-80 ${
                      documentType === key 
                        ? 'text-white' 
                        : 'hover:border-current'
                    }`}
                    style={documentType === key ? { 
                      backgroundColor: companyColor, 
                      borderColor: companyColor 
                    } : {}}
                    onClick={() => setDocumentType(key as CompanyDocumentType)}
                  >
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o conteúdo do documento..."
              rows={3}
            />
          </div>

          {/* Attachment Type Selection */}
          <div className="space-y-3">
            <Label>Tipo de Anexo</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="attachmentType"
                  value="file"
                  checked={attachmentType === 'file'}
                  onChange={() => setAttachmentType('file')}
                  className="text-blue-500"
                />
                <Upload className="h-4 w-4" />
                <span>Arquivo</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="attachmentType"
                  value="link"
                  checked={attachmentType === 'link'}
                  onChange={() => setAttachmentType('link')}
                  className="text-blue-500"
                />
                <Link className="h-4 w-4" />
                <span>Link</span>
              </label>
            </div>
          </div>

          {/* File Upload or Link Input */}
          {attachmentType === 'file' ? (
            <div className="space-y-2">
              <Label htmlFor="file">Arquivo *</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                required
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="linkUrl">URL do Link *</Label>
              <Input
                id="linkUrl"
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://exemplo.com/documento"
                required
              />
            </div>
          )}

          {/* Access Control - Only show if company is selected */}
          {selectedCompanyForDialog && (
            <div className="space-y-4">
              <Label className="text-base font-medium">Controle de Acesso</Label>
              
              <Tabs value={accessType} onValueChange={(value) => setAccessType(value as 'public' | 'roles' | 'users')}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="public" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Público
                  </TabsTrigger>
                  <TabsTrigger value="roles" className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Por Cargos
                  </TabsTrigger>
                  <TabsTrigger value="users" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Por Usuários
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="public" className="mt-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700">
                      Este documento será visível para todos os colaboradores da empresa.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="roles" className="mt-4">
                  {availableRoles.length > 0 ? (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Restringir acesso aos cargos:</Label>
                      <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto border rounded-md p-3">
                        {availableRoles.map((role) => (
                          <div key={role.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`role-${role.id}`}
                              checked={selectedRoles.includes(role.id)}
                              onCheckedChange={(checked) => handleRoleToggle(role.id, checked === true)}
                            />
                            <Label htmlFor={`role-${role.id}`} className="text-sm">
                              {role.title}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {selectedRoles.length === 0 && (
                        <p className="text-sm text-orange-600">
                          Selecione pelo menos um cargo
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-700">
                        Nenhum cargo disponível para esta empresa.
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="users" className="mt-4">
                  {usersLoading ? (
                    <div className="p-4 text-center">
                      <div className="animate-spin h-6 w-6 border-t-2 border-blue-500 border-r-2 rounded-full mx-auto mb-2"></div>
                      <p className="text-sm text-gray-500">Carregando usuários...</p>
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
                </TabsContent>
              </Tabs>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isUploading || !isFormValid() || !selectedCompanyForDialog}
              style={{ backgroundColor: companyColor, borderColor: companyColor }}
            >
              {isUploading ? 'Criando...' : 'Criar Documento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
