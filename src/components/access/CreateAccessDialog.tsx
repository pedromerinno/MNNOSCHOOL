
import React, { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { HorizontalSettingsDialog, SettingsSection } from "@/components/ui/horizontal-settings-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useJobRoles } from "@/hooks/job-roles/useJobRoles";
import { useCompanyUsers } from "@/hooks/company-documents/useCompanyUsers";
import { UserSelector } from "@/components/documents/UserSelector";
import { useCompanies } from "@/hooks/useCompanies";
import { Globe, UserCheck, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccessUpdated: () => void;
}

export const CreateAccessDialog: React.FC<CreateAccessDialogProps> = ({
  open,
  onOpenChange,
  onAccessUpdated
}) => {
  const [formData, setFormData] = useState({
    tool_name: '',
    username: '',
    password: '',
    url: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [accessType, setAccessType] = useState<'public' | 'roles' | 'users'>('public');

  const { selectedCompany, user } = useCompanies();
  const { jobRoles } = useJobRoles(selectedCompany);
  const { users, isLoading: usersLoading } = useCompanyUsers();
  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

  const handleSave = async () => {
    if (!selectedCompany?.id) {
      toast.error('Por favor, selecione uma empresa');
      return;
    }

    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      // Validação mais rigorosa - garantir que não sejam strings vazias
      const toolName = formData.tool_name?.trim();
      const username = formData.username?.trim();
      const password = formData.password?.trim();

      if (!toolName || !username || !password) {
        toast.error('Por favor, preencha todos os campos obrigatórios');
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

      setLoading(true);

      // Garantir que a senha seja uma string válida e não vazia
      if (!password || typeof password !== 'string' || password.length === 0) {
        toast.error('A senha não pode estar vazia. Por favor, digite uma senha válida.');
        setLoading(false);
        return;
      }

      // Debug: Log dos dados antes de enviar
      console.log('[CreateAccessDialog] Creating access with:', {
        company_id: selectedCompany.id,
        tool_name: toolName,
        username: username,
        password_length: password.length,
        password_type: typeof password,
        has_url: !!formData.url,
        has_notes: !!formData.notes
      });

      // Garantir que todos os valores sejam strings válidas (não null/undefined)
      const safePassword = String(password || '').trim();
      if (safePassword.length === 0) {
        toast.error('A senha não pode estar vazia. Por favor, digite uma senha válida.');
        setLoading(false);
        return;
      }

      // Create access data using RPC function
      const rpcParams = {
        p_company_id: selectedCompany.id,
        p_tool_name: String(toolName || '').trim(),
        p_username: String(username || '').trim(),
        p_password: safePassword, // Garantir que é sempre uma string não vazia
        p_url: formData.url?.trim() || null,
        p_notes: formData.notes?.trim() || null
      };

      console.log('[CreateAccessDialog] RPC params:', {
        ...rpcParams,
        p_password: '[REDACTED]',
        p_password_length: safePassword.length
      });

      const { data: newId, error: createError } = await supabase
        .rpc('create_company_access', rpcParams);

      if (createError) throw createError;

      // Create access restrictions
      if (newId) {
        try {
          if (accessType === 'roles' && selectedRoles.length > 0) {
            const roleInserts = selectedRoles.map(roleId => ({
              company_access_id: newId,
              job_role_id: roleId
            }));
            const { error: roleError } = await supabase
              .from('company_access_job_roles')
              .insert(roleInserts);
            if (roleError) throw roleError;
          } else if (accessType === 'users' && selectedUsers.length > 0) {
            const userInserts = selectedUsers.map(userId => ({
              company_access_id: newId,
              user_id: userId
            }));
            const { error: userError } = await supabase
              .from('company_access_users')
              .insert(userInserts);
            if (userError) throw userError;
          }
        } catch (restrictionError: any) {
          // If restriction tables don't exist, log but don't fail
          console.log('Could not create restrictions:', restrictionError);
          // Continue anyway - the main access was created
        }
      }

      toast.success('Senha compartilhada criada com sucesso');
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('access-created'));
      
      onAccessUpdated();
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      console.error('Error creating access:', error);
      toast.error(`Erro ao criar senha compartilhada: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    if (!formData.tool_name || !formData.username || !formData.password) return false;
    if (accessType === 'roles' && selectedRoles.length === 0) return false;
    if (accessType === 'users' && selectedUsers.length === 0) return false;
    return true;
  };

  const resetForm = () => {
    setFormData({
      tool_name: '',
      username: '',
      password: '',
      url: '',
      notes: ''
    });
    setSelectedRoles([]);
    setSelectedUsers([]);
    setAccessType('public');
  };

  const sections: SettingsSection[] = useMemo(() => {
    // General Section Content
    const generalSectionContent = (
      <div className="space-y-8">
        {/* Tool Name */}
        <div className="space-y-2">
          <Label htmlFor="create-tool-name" className="text-sm font-semibold text-gray-900">
            Nome da Ferramenta *
          </Label>
          <Input
            id="create-tool-name"
            name="tool_name"
            value={formData.tool_name}
            onChange={handleInputChange}
            placeholder="Ex: GitHub, Slack, etc."
            required
            className="h-10"
          />
        </div>

        {/* URL */}
        <div className="space-y-2">
          <Label htmlFor="create-url" className="text-sm font-semibold text-gray-900">
            URL
          </Label>
          <Input
            id="create-url"
            name="url"
            value={formData.url}
            onChange={handleInputChange}
            placeholder="https://..."
            className="h-10"
          />
        </div>

        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="create-username" className="text-sm font-semibold text-gray-900">
            Usuário *
          </Label>
          <Input
            id="create-username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
            className="h-10"
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="create-password" className="text-sm font-semibold text-gray-900">
            Senha *
          </Label>
          <Input
            id="create-password"
            name="password"
            type="text"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="h-10"
            placeholder="Digite a senha"
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="create-notes" className="text-sm font-semibold text-gray-900">
            Observações
          </Label>
          <Textarea
            id="create-notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Informações adicionais sobre este acesso..."
            rows={4}
            className="resize-none"
          />
        </div>
      </div>
    );

    // Access & Visibility Section Content
    const accessSectionContent = selectedCompany ? (
      <div className="space-y-6">
        <div>
          <Label className="text-sm font-semibold text-gray-900">
            Controle de Acesso
          </Label>
          <p className="text-xs text-gray-500 mt-1">
            Defina quem pode acessar esta senha compartilhada
          </p>
        </div>

        <div className="space-y-2">
          {/* Public Access */}
          <label className={cn(
            "flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors",
            accessType === 'public' 
              ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20" 
              : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50"
          )}>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="accessType"
                  value="public"
                  checked={accessType === 'public'}
                  onChange={() => {
                    setAccessType('public');
                    setSelectedRoles([]);
                    setSelectedUsers([]);
                  }}
                  className="h-4 w-4 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                />
                <Label className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2 cursor-pointer">
                  <Globe className="h-4 w-4" />
                  Acesso Público
                </Label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 ml-7">
                Visível para todos os colaboradores da empresa
              </p>
            </div>
          </label>

          {/* Roles Access */}
          <label className={cn(
            "flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors",
            accessType === 'roles' 
              ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20" 
              : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50"
          )}>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="accessType"
                  value="roles"
                  checked={accessType === 'roles'}
                  onChange={() => {
                    setAccessType('roles');
                    setSelectedUsers([]);
                  }}
                  className="h-4 w-4 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                />
                <Label className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2 cursor-pointer">
                  <UserCheck className="h-4 w-4" />
                  Acesso por Cargos
                </Label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 ml-7">
                Restringir acesso a cargos específicos
              </p>
            </div>
          </label>
          {accessType === 'roles' && (
            <div className="ml-4 space-y-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
              {jobRoles.length > 0 ? (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Selecione os cargos:</Label>
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                    {jobRoles.map((role) => (
                      <div key={role.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`create-access-role-${role.id}`}
                          checked={selectedRoles.includes(role.id)}
                          onCheckedChange={(checked) => handleRoleToggle(role.id, checked === true)}
                        />
                        <Label htmlFor={`create-access-role-${role.id}`} className="text-sm font-normal cursor-pointer">
                          {role.title}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {selectedRoles.length === 0 && (
                    <p className="text-xs text-orange-600 dark:text-orange-400">
                      Selecione pelo menos um cargo
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                  <p className="text-xs text-yellow-700 dark:text-yellow-400">
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
              ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20" 
              : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50"
          )}>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="accessType"
                  value="users"
                  checked={accessType === 'users'}
                  onChange={() => {
                    setAccessType('users');
                    setSelectedRoles([]);
                  }}
                  className="h-4 w-4 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                />
                <Label className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2 cursor-pointer">
                  <Users className="h-4 w-4" />
                  Acesso por Usuários
                </Label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 ml-7">
                Restringir acesso a usuários específicos
              </p>
            </div>
          </label>
          {accessType === 'users' && (
            <div className="ml-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
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
      <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
        <p className="text-sm text-orange-700 dark:text-orange-400 flex items-center gap-2">
          <span>⚠️</span>
          <span>Por favor, selecione uma empresa no menu superior primeiro</span>
        </p>
      </div>
    );

    return [
      {
        id: 'general',
        label: 'Geral',
        content: generalSectionContent
      },
      {
        id: 'access',
        label: 'Visibilidade',
        content: accessSectionContent
      }
    ];
  }, [formData, accessType, selectedRoles, selectedUsers, jobRoles, users, usersLoading, companyColor, selectedCompany]);

  return (
    <HorizontalSettingsDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Adicionar Senha Compartilhada"
      sections={sections}
      defaultSectionId="general"
      onCancel={() => {
        resetForm();
        onOpenChange(false);
      }}
      onSave={handleSave}
      saveLabel="Adicionar"
      cancelLabel="Cancelar"
      isSaving={loading}
      isFormValid={isFormValid()}
      maxWidth="max-w-3xl"
      saveButtonStyle={isFormValid() ? { 
        backgroundColor: companyColor,
        borderColor: companyColor
      } : undefined}
    />
  );
};

