
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CompanyDocument, CompanyDocumentType, COMPANY_DOCUMENT_TYPE_LABELS } from "@/types/company-document";
import { JobRole } from "@/types/job-roles";
import { useJobRoles } from "@/hooks/job-roles/useJobRoles";
import { useCompanyUsers } from "@/hooks/company-documents/useCompanyUsers";
import { UserSelector } from "./UserSelector";
import { useCompanies } from "@/hooks/useCompanies";
import { Tag } from 'lucide-react';

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
    selectedUsers: string[]
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
      
      // Determinar tipo de acesso baseado nos dados do documento
      if (document.job_roles && document.job_roles.length > 0) {
        setAccessType('roles');
        // Aqui precisaríamos buscar os IDs dos cargos baseado nos nomes
        setSelectedRoles([]);
      } else if (document.allowed_users && document.allowed_users.length > 0) {
        setAccessType('users');
        // Aqui precisaríamos buscar os IDs dos usuários baseado nos nomes
        setSelectedUsers([]);
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!document || !name.trim()) return;
    
    const rolesToSubmit = accessType === 'roles' ? selectedRoles : [];
    const usersToSubmit = accessType === 'users' ? selectedUsers : [];
    
    const success = await onUpdate(
      document.id,
      name,
      description,
      documentType,
      rolesToSubmit,
      usersToSubmit
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

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Editar Documento da Empresa
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nome do Documento *</Label>
            <Input
              id="edit-name"
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

          <div className="space-y-2">
            <Label htmlFor="edit-description">Descrição</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o conteúdo do documento..."
              rows={3}
            />
          </div>

          {/* Access Control */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Controle de Acesso</Label>
            
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="accessType"
                  value="public"
                  checked={accessType === 'public'}
                  onChange={() => setAccessType('public')}
                />
                <span>Público</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="accessType"
                  value="roles"
                  checked={accessType === 'roles'}
                  onChange={() => setAccessType('roles')}
                />
                <span>Por Cargos</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="accessType"
                  value="users"
                  checked={accessType === 'users'}
                  onChange={() => setAccessType('users')}
                />
                <span>Por Usuários</span>
              </label>
            </div>

            {accessType === 'roles' && jobRoles.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Restringir acesso aos cargos:</Label>
                <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto border rounded-md p-3">
                  {jobRoles.map((role) => (
                    <div key={role.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-role-${role.id}`}
                        checked={selectedRoles.includes(role.id)}
                        onCheckedChange={(checked) => handleRoleToggle(role.id, checked === true)}
                      />
                      <Label htmlFor={`edit-role-${role.id}`} className="text-sm">
                        {role.title}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {accessType === 'users' && (
              usersLoading ? (
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
              )
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUpdating}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isUpdating || !isFormValid()}
              style={{ backgroundColor: companyColor, borderColor: companyColor }}
            >
              {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
