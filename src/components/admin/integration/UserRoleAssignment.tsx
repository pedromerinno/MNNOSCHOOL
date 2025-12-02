
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/hooks/useUsers";
import { JobRole } from "@/types/job-roles";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface UserRoleAssignmentProps {
  user: UserProfile;
  companyId: string;
  onSuccess?: () => void;
}

export const UserRoleAssignment: React.FC<UserRoleAssignmentProps> = ({ 
  user, 
  companyId,
  onSuccess 
}) => {
  const { toast } = useToast();
  const [roles, setRoles] = useState<JobRole[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [currentRoleId, setCurrentRoleId] = useState<string>("");
  const [currentRoleTitle, setCurrentRoleTitle] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('[UserRoleAssignment] Fetching data for user:', user.id, 'company:', companyId);
        
        // Buscar cargos da empresa
        const { data: roleData, error: roleError } = await supabase
          .from('job_roles')
          .select('*')
          .eq('company_id', companyId)
          .order('title');
          
        if (roleError) {
          console.error('[UserRoleAssignment] Error fetching roles:', roleError);
          throw roleError;
        }
        
        console.log('[UserRoleAssignment] Roles fetched:', roleData?.length || 0);
        setRoles(roleData as JobRole[] || []);
        
        // Buscar cargo do usuário nesta empresa específica (nova estrutura)
        const { data: userCompany, error: userCompanyError } = await supabase
          .from('user_empresa')
          .select('cargo_id')
          .eq('user_id', user.id)
          .eq('empresa_id', companyId)
          .single();
          
        if (userCompanyError && userCompanyError.code !== 'PGRST116') {
          console.error('[UserRoleAssignment] Error fetching user company relation:', userCompanyError);
          // Não é erro fatal, usuário pode não ter relação com a empresa ainda
        }
        
        const userCargoId = userCompany?.cargo_id || null;
        console.log('[UserRoleAssignment] User cargo_id for company:', userCargoId);
        
        if (userCargoId) {
          setCurrentRoleId(userCargoId);
          setSelectedRoleId(userCargoId);
          
          // Buscar título do cargo atual
          const currentRole = roleData?.find(role => role.id === userCargoId);
          if (currentRole) {
            setCurrentRoleTitle(currentRole.title);
            console.log('[UserRoleAssignment] Current role found:', currentRole.title);
          } else {
            console.warn('[UserRoleAssignment] Current role not found in company roles');
            setCurrentRoleTitle('Cargo não encontrado');
          }
        } else {
          console.log('[UserRoleAssignment] No cargo assigned to user for this company');
          setCurrentRoleId("");
          setSelectedRoleId("");
          setCurrentRoleTitle("");
        }
      } catch (error: any) {
        console.error("[UserRoleAssignment] Error fetching role data:", error);
        setError(`Erro ao carregar dados: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user?.id && companyId) {
      fetchData();
    }
  }, [user?.id, companyId]);
  
  const handleSaveRole = async () => {
    if (!selectedRoleId) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um cargo",
        variant: "destructive",
      });
      return;
    }
    
    console.log('[UserRoleAssignment] Saving role:', selectedRoleId, 'for user:', user.id);
    setIsSaving(true);
    setError(null);
    
    try {
      // Verificar se a associação user_empresa existe
      const { data: existingRelation, error: checkError } = await supabase
        .from('user_empresa')
        .select('id')
        .eq('user_id', user.id)
        .eq('empresa_id', companyId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingRelation) {
        // Atualizar a associação existente
        const { error } = await supabase
          .from('user_empresa')
          .update({ cargo_id: selectedRoleId })
          .eq('id', existingRelation.id);
          
        if (error) {
          console.error('[UserRoleAssignment] Error updating user_empresa:', error);
          throw error;
        }
      } else {
        // Criar nova associação se não existir
        const { error } = await supabase
          .from('user_empresa')
          .insert({
            user_id: user.id,
            empresa_id: companyId,
            cargo_id: selectedRoleId,
            is_admin: false,
          });
          
        if (error) {
          console.error('[UserRoleAssignment] Error creating user_empresa relation:', error);
          throw error;
        }
      }
      
      console.log('[UserRoleAssignment] User company role updated successfully');
      
      // Atualizar estado local
      setCurrentRoleId(selectedRoleId);
      
      // Buscar título do cargo atualizado
      const updatedRole = roles.find(role => role.id === selectedRoleId);
      if (updatedRole) {
        setCurrentRoleTitle(updatedRole.title);
        console.log('[UserRoleAssignment] Role title updated:', updatedRole.title);
      }
      
      // Disparar evento personalizado para notificar outros componentes
      window.dispatchEvent(new CustomEvent('user-role-updated', {
        detail: { 
          userId: user.id,
          roleId: selectedRoleId,
          companyId: companyId
        }
      }));
      
      // Disparar evento específico para atualizar a página de integração
      window.dispatchEvent(new CustomEvent('integration-role-updated', {
        detail: { 
          userId: user.id,
          roleId: selectedRoleId,
          companyId: companyId,
          roleTitle: updatedRole?.title
        }
      }));
      
      toast({
        title: "Sucesso",
        description: "Cargo atualizado com sucesso",
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error: any) {
      console.error("[UserRoleAssignment] Error updating role:", error);
      setError(`Erro ao atualizar cargo: ${error.message}`);
      toast({
        title: "Erro",
        description: `Erro ao atualizar cargo: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleRemoveRole = async () => {
    if (!confirm("Tem certeza que deseja remover o cargo deste usuário?")) return;
    
    console.log('[UserRoleAssignment] Removing role for user:', user.id);
    setIsSaving(true);
    setError(null);
    
    try {
      // Atualizar user_empresa para remover o cargo nesta empresa
      const { data: existingRelation, error: checkError } = await supabase
        .from('user_empresa')
        .select('id')
        .eq('user_id', user.id)
        .eq('empresa_id', companyId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingRelation) {
        const { error } = await supabase
          .from('user_empresa')
          .update({ cargo_id: null })
          .eq('id', existingRelation.id);
          
        if (error) {
          console.error('[UserRoleAssignment] Error removing role:', error);
          throw error;
        }
      } else {
        console.log('[UserRoleAssignment] No relation found, nothing to remove');
      }
      
      console.log('[UserRoleAssignment] Role removed successfully');
      
      setCurrentRoleId("");
      setCurrentRoleTitle("");
      setSelectedRoleId("");
      
      // Disparar evento personalizado para notificar outros componentes
      window.dispatchEvent(new CustomEvent('user-role-updated', {
        detail: { 
          userId: user.id,
          roleId: null,
          companyId: companyId
        }
      }));
      
      // Disparar evento específico para atualizar a página de integração
      window.dispatchEvent(new CustomEvent('integration-role-updated', {
        detail: { 
          userId: user.id,
          roleId: null,
          companyId: companyId,
          roleTitle: null
        }
      }));
      
      toast({
        title: "Sucesso",
        description: "Cargo removido com sucesso",
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error: any) {
      console.error("[UserRoleAssignment] Error removing role:", error);
      setError(`Erro ao remover cargo: ${error.message}`);
      toast({
        title: "Erro",
        description: `Erro ao remover cargo: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin h-6 w-6 border-t-2 border-blue-500 border-r-2 rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div>
            <Label className="text-sm font-medium">Usuário</Label>
            <p className="text-sm text-gray-600 dark:text-gray-400">{user.display_name || user.email}</p>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Cargo Atual</Label>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {currentRoleTitle || "Nenhum cargo atribuído"}
            </p>
          </div>
          
          {roles.length > 0 ? (
            <>
              <div>
                <Label htmlFor="role-select">Selecionar Cargo</Label>
                <Select
                  value={selectedRoleId}
                  onValueChange={(value) => {
                    console.log('[UserRoleAssignment] Role selected:', value);
                    setSelectedRoleId(value);
                  }}
                >
                  <SelectTrigger id="role-select">
                    <SelectValue placeholder="Selecione um cargo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2 justify-end pt-2">
                {currentRoleId && (
                  <Button 
                    variant="outline" 
                    onClick={handleRemoveRole}
                    disabled={isSaving}
                  >
                    Remover Cargo
                  </Button>
                )}
                <Button 
                  onClick={handleSaveRole} 
                  disabled={isSaving || !selectedRoleId || selectedRoleId === currentRoleId}
                >
                  {isSaving ? "Salvando..." : "Salvar Cargo"}
                </Button>
              </div>
            </>
          ) : (
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Não há cargos disponíveis. Adicione cargos na aba "Cargos" antes de fazer atribuições.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
