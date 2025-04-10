
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
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/hooks/useUsers";

interface JobRole {
  id: string;
  title: string;
}

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
  const [roles, setRoles] = useState<JobRole[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [currentRoleId, setCurrentRoleId] = useState<string | null>(null);
  const [currentRoleTitle, setCurrentRoleTitle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Buscar cargos disponíveis e cargo atual do usuário
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Buscar cargos da empresa
        const { data: roleData, error: roleError } = await supabase
          .from('job_roles')
          .select('id, title')
          .eq('company_id', companyId)
          .order('title');
          
        if (roleError) throw roleError;
        
        setRoles(roleData || []);
        
        // Buscar cargo atual do usuário
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('cargo_id')
          .eq('id', user.id)
          .single();
          
        if (userError && userError.code !== 'PGRST116') throw userError;
        
        if (userData?.cargo_id) {
          setCurrentRoleId(userData.cargo_id);
          setSelectedRoleId(userData.cargo_id);
          
          // Buscar nome do cargo atual
          const { data: currentRoleData, error: currentRoleError } = await supabase
            .from('job_roles')
            .select('title')
            .eq('id', userData.cargo_id)
            .single();
            
          if (currentRoleError && currentRoleError.code !== 'PGRST116') throw currentRoleError;
          
          if (currentRoleData) {
            setCurrentRoleTitle(currentRoleData.title);
          }
        }
      } catch (error: any) {
        console.error("Error fetching role data:", error);
        toast.error(`Erro ao carregar dados: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user && companyId) {
      fetchData();
    }
  }, [user, companyId]);
  
  const handleSaveRole = async () => {
    if (!selectedRoleId) {
      toast.error("Por favor, selecione um cargo");
      return;
    }
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          cargo_id: selectedRoleId,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Atualizar o estado local
      setCurrentRoleId(selectedRoleId);
      
      // Buscar nome do cargo atualizado
      const { data: updatedRoleData, error: updatedRoleError } = await supabase
        .from('job_roles')
        .select('title')
        .eq('id', selectedRoleId)
        .single();
        
      if (updatedRoleError) throw updatedRoleError;
      
      if (updatedRoleData) {
        setCurrentRoleTitle(updatedRoleData.title);
      }
      
      toast.success("Cargo atualizado com sucesso");
      
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast.error(`Erro ao atualizar cargo: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleRemoveRole = async () => {
    if (!confirm("Tem certeza que deseja remover o cargo deste usuário?")) return;
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          cargo_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Atualizar o estado local
      setCurrentRoleId(null);
      setCurrentRoleTitle(null);
      setSelectedRoleId(null);
      
      toast.success("Cargo removido com sucesso");
      
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error: any) {
      console.error("Error removing role:", error);
      toast.error(`Erro ao remover cargo: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <div className="animate-spin h-6 w-6 border-t-2 border-blue-500 border-r-2 rounded-full mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Carregando informações de cargo...</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Usuário</Label>
            <p className="text-sm text-gray-600">{user.display_name || user.email}</p>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Cargo Atual</Label>
            <p className="text-sm text-gray-600">
              {currentRoleTitle || "Nenhum cargo atribuído"}
            </p>
          </div>
          
          {roles.length > 0 ? (
            <>
              <div>
                <Label htmlFor="role-select">Selecionar Cargo</Label>
                <Select
                  value={selectedRoleId || ""}
                  onValueChange={setSelectedRoleId}
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
                  disabled={isSaving || selectedRoleId === currentRoleId}
                >
                  {isSaving ? "Salvando..." : "Salvar Cargo"}
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded">
              Não há cargos disponíveis. Adicione cargos na aba "Cargos" antes de fazer atribuições.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
