
import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { HorizontalSettingsDialog, SettingsSection } from "@/components/ui/horizontal-settings-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AccessItem } from "./types";
import { useJobRoles } from "@/hooks/job-roles/useJobRoles";
import { useCompanyUsers } from "@/hooks/company-documents/useCompanyUsers";
import { UserSelector } from "@/components/documents/UserSelector";
import { useCompanies } from "@/hooks/useCompanies";
import { Globe, UserCheck, Users, Key, ExternalLink, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accessItem: AccessItem | null;
  onAccessUpdated: () => void;
}

export const EditAccessDialog: React.FC<EditAccessDialogProps> = ({
  open,
  onOpenChange,
  accessItem,
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

  const { selectedCompany } = useCompanies();
  const { jobRoles } = useJobRoles(selectedCompany);
  const { users, isLoading: usersLoading } = useCompanyUsers();
  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";

  // Load access data and restrictions when dialog opens
  useEffect(() => {
    if (accessItem && open) {
      setFormData({
        tool_name: accessItem.tool_name || '',
        username: accessItem.username || '',
        password: accessItem.password || '', // Ensure password is always pre-filled
        url: accessItem.url || '',
        notes: accessItem.notes || ''
      });
      fetchAccessRestrictions();
    }
  }, [accessItem, open]);

  const fetchAccessRestrictions = async () => {
    if (!accessItem) return;

    try {
      // Check for role restrictions
      const { data: roleData } = await supabase
        .from('company_access_job_roles')
        .select('job_role_id')
        .eq('company_access_id', accessItem.id);

      // Check for user restrictions
      const { data: userData } = await supabase
        .from('company_access_users')
        .select('user_id')
        .eq('company_access_id', accessItem.id);

      if (roleData && roleData.length > 0) {
        setAccessType('roles');
        setSelectedRoles(roleData.map(r => r.job_role_id));
      } else if (userData && userData.length > 0) {
        setAccessType('users');
        setSelectedUsers(userData.map(u => u.user_id));
      } else {
        setAccessType('public');
        setSelectedRoles([]);
        setSelectedUsers([]);
      }
    } catch (error) {
      // If tables don't exist yet, assume public access
      console.log('Access restrictions tables may not exist yet');
      setAccessType('public');
      setSelectedRoles([]);
      setSelectedUsers([]);
    }
  };

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
    if (!accessItem) return;

    try {
      if (!formData.tool_name || !formData.username || !formData.password) {
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

      // Update access data using RPC function (plain text password)
      const { error: updateError } = await supabase
        .rpc('update_company_access', {
          p_id: accessItem.id,
          p_tool_name: formData.tool_name,
          p_username: formData.username,
          p_password: formData.password,
          p_url: formData.url || null,
          p_notes: formData.notes || null
        });

      if (updateError) throw updateError;

      // Update access restrictions
      try {
        // Delete existing restrictions
        await supabase
          .from('company_access_job_roles')
          .delete()
          .eq('company_access_id', accessItem.id);

        await supabase
          .from('company_access_users')
          .delete()
          .eq('company_access_id', accessItem.id);

        // Insert new restrictions
        if (accessType === 'roles' && selectedRoles.length > 0) {
          const roleInserts = selectedRoles.map(roleId => ({
            company_access_id: accessItem.id,
            job_role_id: roleId
          }));
          const { error: roleError } = await supabase
            .from('company_access_job_roles')
            .insert(roleInserts);
          if (roleError) throw roleError;
        } else if (accessType === 'users' && selectedUsers.length > 0) {
          const userInserts = selectedUsers.map(userId => ({
            company_access_id: accessItem.id,
            user_id: userId
          }));
          const { error: userError } = await supabase
            .from('company_access_users')
            .insert(userInserts);
          if (userError) throw userError;
        }
      } catch (restrictionError: any) {
        // If restriction tables don't exist, log but don't fail
        console.log('Could not update restrictions:', restrictionError);
        // Continue anyway - the main access was updated
      }

      toast.success('Acesso atualizado com sucesso');
      onAccessUpdated();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating access:', error);
      toast.error(`Erro ao atualizar acesso: ${error.message}`);
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
          <Label htmlFor="edit-tool-name" className="text-sm font-semibold text-gray-900">
            Nome da Ferramenta *
          </Label>
          <Input
            id="edit-tool-name"
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
          <Label htmlFor="edit-url" className="text-sm font-semibold text-gray-900">
            URL
          </Label>
          <Input
            id="edit-url"
            name="url"
            value={formData.url}
            onChange={handleInputChange}
            placeholder="https://..."
            className="h-10"
          />
        </div>

        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="edit-username" className="text-sm font-semibold text-gray-900">
            Usuário *
          </Label>
          <Input
            id="edit-username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
            className="h-10"
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="edit-password" className="text-sm font-semibold text-gray-900">
            Senha *
          </Label>
          <Input
            id="edit-password"
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
          <Label htmlFor="edit-notes" className="text-sm font-semibold text-gray-900">
            Observações
          </Label>
          <Textarea
            id="edit-notes"
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
                          id={`edit-access-role-${role.id}`}
                          checked={selectedRoles.includes(role.id)}
                          onCheckedChange={(checked) => handleRoleToggle(role.id, checked === true)}
                        />
                        <Label htmlFor={`edit-access-role-${role.id}`} className="text-sm font-normal cursor-pointer">
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

  if (!accessItem) return null;

  return (
    <HorizontalSettingsDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Editar Acesso"
      sections={sections}
      defaultSectionId="general"
      onCancel={() => {
        resetForm();
        onOpenChange(false);
      }}
      onSave={handleSave}
      saveLabel="Salvar Alterações"
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
