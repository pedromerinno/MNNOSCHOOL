
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Briefcase, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  X, 
  Save, 
  Check, 
  Info,
  Users
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { JobRole } from "@/types/job-roles";
import RoleUsersDialog from './dialogs/RoleUsersDialog';

interface JobRolesManagerProps {
  company: Company;
}

export const JobRolesManager: React.FC<JobRolesManagerProps> = ({ company }) => {
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<JobRole | null>(null);
  const [newRole, setNewRole] = useState<Partial<JobRole> | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<JobRole | null>(null);
  const [assignedUsers, setAssignedUsers] = useState<{ id: string; display_name: string }[]>([]);
  const [selectedRoleForUsers, setSelectedRoleForUsers] = useState<JobRole | null>(null);
  const [showRoleUsersDialog, setShowRoleUsersDialog] = useState(false);
  
  const fetchJobRoles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('job_roles')
        .select('*')
        .eq('company_id', company.id)
        .order('order_index');
        
      if (error) throw error;
      
      setJobRoles(data || []);
    } catch (error: any) {
      console.error("Error fetching job roles:", error);
      toast.error(`Erro ao carregar cargos: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (company) {
      fetchJobRoles();
    }
  }, [company]);
  
  const handleAddRole = () => {
    setNewRole({
      title: '',
      description: '',
      responsibilities: '',
      requirements: '',
      expectations: '',
      order_index: jobRoles.length,
      company_id: company.id
    });
  };
  
  const handleEditRole = (role: JobRole) => {
    setEditingRole({...role});
  };
  
  const handleCancelEdit = () => {
    setEditingRole(null);
    setNewRole(null);
  };
  
  const handleSaveRole = async (role: Partial<JobRole>, isNew: boolean) => {
    try {
      if (!role.title) {
        toast.error("Título do cargo é obrigatório");
        return;
      }
      
      if (isNew) {
        const { data, error } = await supabase
          .from('job_roles')
          .insert({
            company_id: company.id,
            title: role.title,
            description: role.description || null,
            responsibilities: role.responsibilities || null,
            requirements: role.requirements || null,
            expectations: role.expectations || null,
            order_index: role.order_index
          })
          .select();
          
        if (error) throw error;
        
        toast.success("Cargo adicionado com sucesso");
      } else if (role.id) {
        const { error } = await supabase
          .from('job_roles')
          .update({
            title: role.title,
            description: role.description || null,
            responsibilities: role.responsibilities || null,
            requirements: role.requirements || null,
            expectations: role.expectations || null
          })
          .eq('id', role.id);
          
        if (error) throw error;
        
        toast.success("Cargo atualizado com sucesso");
      }
      
      setEditingRole(null);
      setNewRole(null);
      fetchJobRoles();
      
    } catch (error: any) {
      console.error("Error saving job role:", error);
      toast.error(`Erro ao salvar cargo: ${error.message}`);
    }
  };
  
  const handleDeleteRole = async (roleId: string) => {
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('cargo_id', roleId);
        
      if (error) throw error;
      
      if (count && count > 0) {
        toast.error(`Não é possível excluir: existem ${count} usuários com este cargo.`);
        return;
      }
      
      if (!confirm("Tem certeza que deseja excluir este cargo?")) return;
      
      const { error: deleteError } = await supabase
        .from('job_roles')
        .delete()
        .eq('id', roleId);
        
      if (deleteError) throw deleteError;
      
      toast.success("Cargo excluído com sucesso");
      fetchJobRoles();
      
    } catch (error: any) {
      console.error("Error deleting job role:", error);
      toast.error(`Erro ao excluir cargo: ${error.message}`);
    }
  };
  
  const handleMoveRole = async (roleId: string, direction: 'up' | 'down') => {
    const roleIndex = jobRoles.findIndex(r => r.id === roleId);
    if (roleIndex === -1) return;
    
    const newRoles = [...jobRoles];
    const targetIndex = direction === 'up' ? roleIndex - 1 : roleIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= newRoles.length) return;
    
    const temp = newRoles[roleIndex].order_index;
    newRoles[roleIndex].order_index = newRoles[targetIndex].order_index;
    newRoles[targetIndex].order_index = temp;
    
    [newRoles[roleIndex], newRoles[targetIndex]] = [newRoles[targetIndex], newRoles[roleIndex]];
    
    setJobRoles(newRoles);
    
    try {
      await supabase
        .from('job_roles')
        .update({ order_index: newRoles[roleIndex].order_index })
        .eq('id', newRoles[roleIndex].id);
        
      await supabase
        .from('job_roles')
        .update({ order_index: newRoles[targetIndex].order_index })
        .eq('id', newRoles[targetIndex].id);
        
    } catch (error: any) {
      console.error("Error reordering job roles:", error);
      toast.error(`Erro ao reordenar cargos: ${error.message}`);
      fetchJobRoles();
    }
  };
  
  const showRoleDetails = async (role: JobRole) => {
    setSelectedRole(role);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name')
        .eq('cargo_id', role.id);
        
      if (error) throw error;
      
      setAssignedUsers(data || []);
      setShowDetailsDialog(true);
    } catch (error: any) {
      console.error("Error fetching assigned users:", error);
      toast.error(`Erro ao buscar usuários: ${error.message}`);
    }
  };
  
  const manageRoleUsers = (role: JobRole) => {
    setSelectedRoleForUsers(role);
    setShowRoleUsersDialog(true);
  };
  
  const RoleForm = ({ role, isNew, onSave, onCancel }: { 
    role: Partial<JobRole>, 
    isNew: boolean,
    onSave: () => void,
    onCancel: () => void 
  }) => {
    // Create local state for form values
    const [formValues, setFormValues] = useState({
      title: role.title || '',
      description: role.description || '',
      responsibilities: role.responsibilities || '',
      requirements: role.requirements || '',
      expectations: role.expectations || ''
    });
    
    // Update local state when the role prop changes
    useEffect(() => {
      setFormValues({
        title: role.title || '',
        description: role.description || '',
        responsibilities: role.responsibilities || '',
        requirements: role.requirements || '',
        expectations: role.expectations || ''
      });
    }, [role]);
    
    // Function to update form values locally
    const handleChange = (field: string, value: string) => {
      setFormValues(prev => ({
        ...prev,
        [field]: value
      }));
    };
    
    // Function to save form values to parent state
    const handleSaveValues = () => {
      if (isNew && newRole) {
        setNewRole({
          ...newRole,
          ...formValues
        });
      } else if (editingRole) {
        setEditingRole({
          ...editingRole,
          ...formValues
        });
      }
      onSave();
    };
    
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor={isNew ? "new-title" : `edit-title-${role.id}`}>Título do Cargo*</Label>
              <Input 
                id={isNew ? "new-title" : `edit-title-${role.id}`}
                value={formValues.title} 
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Ex: Desenvolvedor Frontend"
              />
            </div>
            
            <div>
              <Label htmlFor={isNew ? "new-description" : `edit-description-${role.id}`}>Descrição</Label>
              <Textarea 
                id={isNew ? "new-description" : `edit-description-${role.id}`}
                value={formValues.description} 
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Descrição geral do cargo"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor={isNew ? "new-responsibilities" : `edit-responsibilities-${role.id}`}>Responsabilidades</Label>
              <Textarea 
                id={isNew ? "new-responsibilities" : `edit-responsibilities-${role.id}`}
                value={formValues.responsibilities} 
                onChange={(e) => handleChange('responsibilities', e.target.value)}
                placeholder="Responsabilidades do cargo"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor={isNew ? "new-requirements" : `edit-requirements-${role.id}`}>Requisitos</Label>
              <Textarea 
                id={isNew ? "new-requirements" : `edit-requirements-${role.id}`}
                value={formValues.requirements} 
                onChange={(e) => handleChange('requirements', e.target.value)}
                placeholder="Requisitos e habilidades necessárias"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor={isNew ? "new-expectations" : `edit-expectations-${role.id}`}>Expectativas</Label>
              <Textarea 
                id={isNew ? "new-expectations" : `edit-expectations-${role.id}`}
                value={formValues.expectations} 
                onChange={(e) => handleChange('expectations', e.target.value)}
                placeholder="Expectativas do cargo"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSaveValues}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium mb-1">Gerenciar Cargos</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Adicione e gerencie os cargos disponíveis na empresa
          </p>
        </div>
        
        {!newRole && !editingRole && (
          <Button onClick={handleAddRole}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Cargo
          </Button>
        )}
      </div>
      
      {newRole && (
        <RoleForm 
          role={newRole} 
          isNew={true}
          onSave={() => handleSaveRole(newRole, true)}
          onCancel={handleCancelEdit}
        />
      )}
      
      {editingRole && (
        <RoleForm 
          role={editingRole} 
          isNew={false}
          onSave={() => handleSaveRole(editingRole, false)}
          onCancel={handleCancelEdit}
        />
      )}
      
      {isLoading ? (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="animate-spin h-8 w-8 border-t-2 border-blue-500 border-r-2 rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-500">Carregando cargos...</p>
          </CardContent>
        </Card>
      ) : jobRoles.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum cargo adicionado</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Adicione informações sobre os cargos disponíveis na empresa
            </p>
            {!newRole && (
              <Button onClick={handleAddRole}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Cargo
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">Ordem</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveRole(role.id, 'up')}
                        disabled={role.order_index === 0}
                        className="h-6 w-6"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <span>{role.order_index + 1}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveRole(role.id, 'down')}
                        disabled={role.order_index === jobRoles.length - 1}
                        className="h-6 w-6"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{role.title}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-500 truncate max-w-xs">
                      {role.description || "Sem descrição"}
                    </p>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => showRoleDetails(role)}
                        title="Ver detalhes"
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => manageRoleUsers(role)}
                        title="Gerenciar usuários"
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditRole(role)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteRole(role.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
      
      {selectedRole && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedRole.title}</DialogTitle>
              <DialogDescription>
                Detalhes do cargo e usuários associados
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-6 py-4">
              {selectedRole.description && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Descrição</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedRole.description}
                  </p>
                </div>
              )}
              
              {selectedRole.responsibilities && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Responsabilidades</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                    {selectedRole.responsibilities}
                  </p>
                </div>
              )}
              
              {selectedRole.requirements && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Requisitos</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                    {selectedRole.requirements}
                  </p>
                </div>
              )}
              
              {selectedRole.expectations && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Expectativas</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                    {selectedRole.expectations}
                  </p>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-medium mb-2">Usuários com este cargo</h4>
                {assignedUsers.length > 0 ? (
                  <ul className="space-y-1">
                    {assignedUsers.map(user => (
                      <li key={user.id} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>{user.display_name}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">
                    Nenhum usuário está associado a este cargo
                  </p>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                Fechar
              </Button>
              <Button onClick={() => {
                setShowDetailsDialog(false);
                handleEditRole(selectedRole);
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Editar Cargo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {selectedRoleForUsers && (
        <Dialog open={showRoleUsersDialog} onOpenChange={setShowRoleUsersDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Gerenciar usuários - {selectedRoleForUsers.title}</DialogTitle>
              <DialogDescription>
                Adicione ou remova usuários desse cargo
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <RoleUsersDialog roleId={selectedRoleForUsers.id} companyId={company.id} />
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRoleUsersDialog(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
