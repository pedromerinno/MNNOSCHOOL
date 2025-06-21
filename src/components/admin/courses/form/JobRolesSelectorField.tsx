
import React, { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { UseFormReturn } from "react-hook-form";
import { JobRole } from "@/types/job-roles";

interface JobRolesSelectorFieldProps {
  form: UseFormReturn<any>;
  companyIds: string[];
}

export const JobRolesSelectorField: React.FC<JobRolesSelectorFieldProps> = ({ 
  form, 
  companyIds 
}) => {
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const fetchJobRoles = async () => {
    if (!companyIds || companyIds.length === 0) {
      setJobRoles([]);
      return;
    }

    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobRoles();
  }, [companyIds]);

  // Initialize selected roles from form
  useEffect(() => {
    const formRoles = form.getValues('jobRoleIds') || [];
    setSelectedRoles(formRoles);
  }, [form]);

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

  const handleSelectAll = () => {
    const allRoleIds = jobRoles.map(role => role.id);
    setSelectedRoles(allRoleIds);
    form.setValue('jobRoleIds', allRoleIds);
  };

  const handleClearAll = () => {
    setSelectedRoles([]);
    form.setValue('jobRoleIds', []);
  };

  if (!companyIds || companyIds.length === 0) {
    return (
      <FormField
        control={form.control}
        name="jobRoleIds"
        render={() => (
          <FormItem>
            <FormLabel>Cargos com Acesso</FormLabel>
            <FormControl>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">
                    Selecione pelo menos uma empresa primeiro para definir os cargos.
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
      name="jobRoleIds"
      render={() => (
        <FormItem>
          <FormLabel>Controle de Acesso por Cargo</FormLabel>
          <FormControl>
            <Card>
              <CardContent className="p-4 space-y-4">
                {loading ? (
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
                      <p className="text-sm text-muted-foreground">
                        Deixe vazio para permitir acesso a todos os cargos da empresa
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleSelectAll}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          Selecionar Todos
                        </button>
                        <button
                          type="button"
                          onClick={handleClearAll}
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
                  </>
                )}
              </CardContent>
            </Card>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
