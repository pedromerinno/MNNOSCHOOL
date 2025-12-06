
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Loader2, UserCheck, Users, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { UseFormReturn } from "react-hook-form";
import { JobRole } from "@/types/job-roles";
import { useCompanyUsers, CompanyUser } from "@/hooks/company-documents/useCompanyUsers";
import { useCompanies } from "@/hooks/useCompanies";
import { cn } from "@/lib/utils";

interface CourseAccessControlFieldProps {
  form: UseFormReturn<any>;
  companyIds: string[];
}

type AccessType = 'public' | 'roles' | 'users';

export const CourseAccessControlField: React.FC<CourseAccessControlFieldProps> = ({ 
  form, 
  companyIds 
}) => {
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [accessType, setAccessType] = useState<AccessType>('public');
  const previousCompanyIdsRef = useRef<string>('');
  const { selectedCompany } = useCompanies();
  const { users, isLoading: usersLoading } = useCompanyUsers();
  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";

  // Memoize companyIds as string for comparison
  const companyIdsKey = useMemo(() => {
    return JSON.stringify(companyIds?.sort() || []);
  }, [companyIds]);

  const fetchJobRoles = useCallback(async () => {
    if (!companyIds || companyIds.length === 0) {
      setJobRoles([]);
      setLoadingRoles(false);
      return;
    }

    setLoadingRoles(true);
    try {
      const { data, error } = await supabase
        .from('job_roles')
        .select('*')
        .in('company_id', companyIds)
        .order('title');

      if (error) throw error;
      setJobRoles(data || []);
    } catch (error) {
      console.error('Error fetching job roles:', error);
      setJobRoles([]);
    } finally {
      setLoadingRoles(false);
    }
  }, [companyIds]);

  // Only fetch when companyIds actually change
  useEffect(() => {
    const currentKey = companyIdsKey || '';
    if (currentKey && currentKey !== previousCompanyIdsRef.current) {
      previousCompanyIdsRef.current = currentKey;
      fetchJobRoles();
    } else if (!currentKey && previousCompanyIdsRef.current) {
      // Reset when companyIds becomes empty
      previousCompanyIdsRef.current = '';
      setJobRoles([]);
      setLoadingRoles(false);
    }
  }, [companyIdsKey, fetchJobRoles]);

  // Watch form values
  const formAccessType = form.watch('accessType') as AccessType;
  const formJobRoleIds = form.watch('jobRoleIds');
  const formUserIds = form.watch('userIds');
  
  // Initialize accessType if not set
  useEffect(() => {
    const currentAccessType = form.getValues('accessType');
    if (!currentAccessType) {
      form.setValue('accessType', 'public');
      setAccessType('public');
    } else {
      setAccessType(currentAccessType);
    }
  }, [form]);

  // Sync state with form values when they change
  useEffect(() => {
    if (formAccessType) {
      setAccessType(formAccessType);
    }
  }, [formAccessType]);

  useEffect(() => {
    const formRoles = formJobRoleIds || [];
    setSelectedRoles(formRoles);
  }, [formJobRoleIds]);

  useEffect(() => {
    const formUsers = formUserIds || [];
    setSelectedUsers(formUsers);
  }, [formUserIds]);

  const handleAccessTypeChange = (newType: AccessType) => {
    setAccessType(newType);
    form.setValue('accessType', newType);
    
    // Clear selections when switching types
    if (newType === 'public') {
      form.setValue('jobRoleIds', []);
      form.setValue('userIds', []);
      setSelectedRoles([]);
      setSelectedUsers([]);
    } else if (newType === 'roles') {
      form.setValue('userIds', []);
      setSelectedUsers([]);
    } else if (newType === 'users') {
      form.setValue('jobRoleIds', []);
      setSelectedRoles([]);
    }
  };

  const handleRoleToggle = (roleId: string, checked: boolean) => {
    let newSelectedRoles: string[];
    
    if (checked) {
      newSelectedRoles = [...selectedRoles, roleId];
    } else {
      newSelectedRoles = selectedRoles.filter(id => id !== roleId);
    }
    
    setSelectedRoles(newSelectedRoles);
    form.setValue('jobRoleIds', newSelectedRoles);
  };

  const handleUserToggle = (userId: string, checked: boolean) => {
    let newSelectedUsers: string[];
    
    if (checked) {
      newSelectedUsers = [...selectedUsers, userId];
    } else {
      newSelectedUsers = selectedUsers.filter(id => id !== userId);
    }
    
    setSelectedUsers(newSelectedUsers);
    form.setValue('userIds', newSelectedUsers);
  };

  const handleSelectAllRoles = () => {
    const allRoleIds = jobRoles.map(role => role.id);
    setSelectedRoles(allRoleIds);
    form.setValue('jobRoleIds', allRoleIds);
  };

  const handleClearAllRoles = () => {
    setSelectedRoles([]);
    form.setValue('jobRoleIds', []);
  };

  if (!companyIds || companyIds.length === 0) {
    return (
      <FormField
        control={form.control}
        name="accessType"
        render={() => (
          <FormItem>
            <FormLabel>Controle de Acesso</FormLabel>
            <FormControl>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">
                    Selecione pelo menos uma empresa primeiro para definir o controle de acesso.
                  </p>
                </CardContent>
              </Card>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  return (
    <FormField
      control={form.control}
      name="accessType"
      render={() => (
        <FormItem>
          <FormLabel>Controle de Acesso</FormLabel>
          <FormControl>
            <div className="space-y-4">
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
                      name="courseAccessType"
                      value="public"
                      checked={accessType === 'public'}
                      onChange={() => handleAccessTypeChange('public')}
                      className="h-4 w-4 text-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    />
                    <Label className="text-sm font-medium text-gray-900 flex items-center gap-2 cursor-pointer">
                      <Globe className="h-4 w-4" />
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
                      name="courseAccessType"
                      value="roles"
                      checked={accessType === 'roles'}
                      onChange={() => handleAccessTypeChange('roles')}
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
                  {loadingRoles ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="ml-2">Carregando cargos...</span>
                    </div>
                  ) : jobRoles.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhum cargo encontrado para as empresas selecionadas.
                    </p>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Selecione os cargos:</Label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleSelectAllRoles}
                            className="text-xs text-blue-600 hover:text-blue-700"
                          >
                            Selecionar Todos
                          </button>
                          <button
                            type="button"
                            onClick={handleClearAllRoles}
                            className="text-xs text-gray-600 hover:text-gray-700"
                          >
                            Limpar Seleção
                          </button>
                        </div>
                      </div>
                      {selectedRoles.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Cargos selecionados:</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedRoles.map(roleId => {
                              const role = jobRoles.find(r => r.id === roleId);
                              return role ? (
                                <Badge key={roleId} variant="secondary" className="text-xs">
                                  {role.title}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                      <ScrollArea className="h-48">
                        <div className="grid grid-cols-1 gap-3 pr-4">
                          {jobRoles.map(role => (
                            <div key={role.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
                              <Checkbox
                                id={`role-${role.id}`}
                                checked={selectedRoles.includes(role.id)}
                                onCheckedChange={(checked) => 
                                  handleRoleToggle(role.id, checked as boolean)
                                }
                              />
                              <label
                                htmlFor={`role-${role.id}`}
                                className="text-sm font-medium cursor-pointer flex-1"
                              >
                                {role.title}
                              </label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      {selectedRoles.length === 0 && (
                        <p className="text-xs text-orange-600">
                          Selecione pelo menos um cargo
                        </p>
                      )}
                    </>
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
                      name="courseAccessType"
                      value="users"
                      checked={accessType === 'users'}
                      onChange={() => handleAccessTypeChange('users')}
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
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="ml-2">Carregando usuários...</span>
                    </div>
                  ) : users.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhum usuário encontrado para a empresa selecionada.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" style={{ color: companyColor }} />
                        <Label className="text-sm font-medium">Usuários com acesso:</Label>
                      </div>
                      {selectedUsers.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Usuários selecionados:</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedUsers.map(userId => {
                              const user = users.find(u => u.id === userId);
                              return user ? (
                                <Badge key={userId} variant="secondary" className="text-xs">
                                  {user.display_name}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                      <ScrollArea className="h-48 border rounded-md p-3">
                        <div className="space-y-3">
                          {users.map((user) => (
                            <div key={user.id} className="flex items-start space-x-3">
                              <Checkbox
                                id={`user-${user.id}`}
                                checked={selectedUsers.includes(user.id)}
                                onCheckedChange={(checked) => handleUserToggle(user.id, checked === true)}
                              />
                              <div className="flex-1 min-w-0">
                                <Label 
                                  htmlFor={`user-${user.id}`} 
                                  className="text-sm font-medium cursor-pointer flex items-center gap-2"
                                >
                                  <Users className="h-3 w-3" />
                                  {user.display_name}
                                </Label>
                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                {user.job_role && (
                                  <Badge variant="outline" className="mt-1 text-xs">
                                    {user.job_role.title}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      {selectedUsers.length === 0 && (
                        <p className="text-sm text-orange-600 flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Selecione pelo menos um usuário
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
