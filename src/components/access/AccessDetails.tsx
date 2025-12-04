
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AccessField } from "./components/AccessField";
import { AccessDetailsProps } from "./types/access-details";
import { ExternalLink, User, FileText, Edit, Trash2, Globe, UserCheck, Users } from "lucide-react";
import { useIsAdmin } from "@/hooks/company/useIsAdmin";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EditAccessDialog } from "./EditAccessDialog";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

export const AccessDetails = ({ 
  access, 
  isOpen, 
  onClose, 
  companyColor,
  onAccessUpdated
}: AccessDetailsProps) => {
  const { isAdmin } = useIsAdmin();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [accessType, setAccessType] = useState<'public' | 'roles' | 'users'>('public');

  // Fetch access restrictions when dialog opens
  useEffect(() => {
    if (isOpen && access) {
      fetchAccessRestrictions();
    }
  }, [isOpen, access]);

  const fetchAccessRestrictions = async () => {
    if (!access) return;

    try {
      // Check for role restrictions
      const { data: roleData } = await supabase
        .from('company_access_job_roles')
        .select('job_role_id')
        .eq('company_access_id', access.id);

      // Check for user restrictions
      const { data: userData } = await supabase
        .from('company_access_users')
        .select('user_id')
        .eq('company_access_id', access.id);

      if (roleData && roleData.length > 0) {
        setAccessType('roles');
      } else if (userData && userData.length > 0) {
        setAccessType('users');
      } else {
        setAccessType('public');
      }
    } catch (error) {
      // If tables don't exist yet, assume public access
      setAccessType('public');
    }
  };

  // Reset password visibility when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setIsPasswordVisible(false);
    }
  }, [isOpen]);

  if (!access) return null;

  const handleDelete = async () => {
    if (!window.confirm(`Tem certeza que deseja excluir o acesso "${access.tool_name}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('company_access')
        .delete()
        .eq('id', access.id);

      if (error) throw error;
      
      toast.success('Acesso removido com sucesso');
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('access-created'));
      
      if (onAccessUpdated) {
        onAccessUpdated();
      }
      
      onClose();
    } catch (error: any) {
      console.error('Error deleting access:', error);
      toast.error(`Erro ao excluir acesso: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleAccessUpdated = () => {
    if (onAccessUpdated) {
      onAccessUpdated();
    }
    setIsEditDialogOpen(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {access.tool_name}
          </DialogTitle>
          <DialogDescription>
            Detalhes completos do acesso compartilhado
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-2">
          {/* URL Section */}
          {access.url && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <ExternalLink className="h-4 w-4" style={{ color: companyColor }} />
                URL
              </div>
              <AccessField
                label=""
                value={access.url}
                copyMessage="URL copiada!"
                hasExternalLink
              />
            </div>
          )}
          
          {/* Credentials Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <User className="h-4 w-4" style={{ color: companyColor }} />
              Credenciais
            </div>
            
            <div className="space-y-3 pl-6 border-l-2" style={{ borderColor: companyColor ? `${companyColor}40` : 'rgba(0, 0, 0, 0.1)' }}>
              <AccessField
                key={`username-${access.id}`}
                label="Usuário"
                value={access.username}
                copyMessage="Usuário copiado!"
              />
              
              <AccessField
                key={`password-${access.id}`}
                label="Senha"
                value={access.password}
                copyMessage="Senha copiada!"
                isPassword
                isPasswordVisible={isPasswordVisible}
                onTogglePasswordVisibility={() => setIsPasswordVisible(!isPasswordVisible)}
              />
            </div>
          </div>

          {/* Notes Section */}
          {access.notes && (
            <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <FileText className="h-4 w-4" style={{ color: companyColor }} />
                Observações
              </div>
              <AccessField
                label=""
                value={access.notes}
                canCopy={false}
              />
            </div>
          )}

          {/* Visibility Section */}
          <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <Globe className="h-4 w-4" style={{ color: companyColor }} />
              Visibilidade
            </div>
            <div className="space-y-2">
              {/* Public Access */}
              <div className={cn(
                "flex items-center justify-between p-4 border rounded-lg",
                accessType === 'public' 
                  ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20" 
                  : "border-gray-200 dark:border-gray-800"
              )}>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Acesso Público
                    </Label>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 ml-7">
                    Visível para todos os colaboradores da empresa
                  </p>
                </div>
              </div>

              {/* Roles Access */}
              {accessType === 'roles' && (
                <div className={cn(
                  "flex items-center justify-between p-4 border rounded-lg",
                  "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                )}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <UserCheck className="h-4 w-4 text-gray-500" />
                      <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Acesso por Cargos
                      </Label>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 ml-7">
                      Restringido a cargos específicos
                    </p>
                  </div>
                </div>
              )}

              {/* Users Access */}
              {accessType === 'users' && (
                <div className={cn(
                  "flex items-center justify-between p-4 border rounded-lg",
                  "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                )}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-gray-500" />
                      <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Acesso por Usuários
                      </Label>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 ml-7">
                      Restringido a usuários específicos
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
          {isAdmin && (
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={handleEdit}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar
              </Button>
              <Button 
                variant="outline"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <Trash2 className="h-4 w-4" />
                {isDeleting ? 'Removendo...' : 'Remover'}
              </Button>
            </div>
          )}
          <div className="flex gap-2 ml-auto">
            <Button 
              variant="outline"
              onClick={onClose}
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
      
      <EditAccessDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        accessItem={access}
        onAccessUpdated={handleAccessUpdated}
      />
    </Dialog>
  );
};
