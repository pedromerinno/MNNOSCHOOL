
import React, { useState } from 'react';
import { AccessItem } from './types';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Edit, Trash2 } from "lucide-react";
import { AccessCardComponent } from './AccessCardComponent';

interface AccessCardProps {
  item: AccessItem;
  onClick: () => void;
  companyColor?: string;
  onEdit?: (item: AccessItem) => void;
  onAccessUpdated?: () => void;
}

export const AccessCard = ({ item, onClick, companyColor, onEdit, onAccessUpdated }: AccessCardProps) => {
  const { userProfile } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  // Check if user is admin, super admin, or the creator of this access
  const isAdmin = userProfile?.is_admin || userProfile?.super_admin;
  const isCreator = item.created_by === userProfile?.id;
  const canEdit = isAdmin || isCreator;

  const handleDelete = async (accessItem: AccessItem) => {
    if (!window.confirm(`Tem certeza que deseja excluir o acesso "${accessItem.tool_name}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('company_access')
        .delete()
        .eq('id', accessItem.id);

      if (error) throw error;
      
      toast.success('Acesso removido com sucesso');
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('access-created'));
      
      if (onAccessUpdated) {
        onAccessUpdated();
      }
    } catch (error: any) {
      console.error('Error deleting access:', error);
      toast.error(`Erro ao excluir acesso: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (accessItem: AccessItem) => {
    if (onEdit) {
      onEdit(accessItem);
    }
  };

  // If user can edit, wrap with context menu for right-click actions
  if (canEdit) {
    return (
      <ContextMenu>
        <ContextMenuTrigger>
          <AccessCardComponent
            item={item}
            onClick={onClick}
            companyColor={companyColor}
            onEdit={handleEdit}
            onDelete={handleDelete}
            canEdit={canEdit}
          />
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => handleEdit(item)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </ContextMenuItem>
          <ContextMenuItem 
            onClick={() => handleDelete(item)}
            className="text-red-600 focus:text-red-600"
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? 'Removendo...' : 'Remover'}
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  }

  return (
    <AccessCardComponent
      item={item}
      onClick={onClick}
      companyColor={companyColor}
      onEdit={handleEdit}
      onDelete={handleDelete}
      canEdit={canEdit}
    />
  );
};
