
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Key, Copy, Edit, Trash2, MoreVertical } from "lucide-react";
import { AccessItem } from './types';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCompanies } from "@/hooks/useCompanies";

interface AccessCardProps {
  item: AccessItem;
  onClick: () => void;
  companyColor?: string;
  onEdit?: (item: AccessItem) => void;
  onAccessUpdated?: () => void;
}

export const AccessCard = ({ item, onClick, companyColor, onEdit, onAccessUpdated }: AccessCardProps) => {
  const { user } = useCompanies();
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Check if user is admin or super admin
  const isAdmin = user?.is_admin || user?.super_admin;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success(`${type} copiado para área de transferência`))
      .catch(() => toast.error('Falha ao copiar'));
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!window.confirm(`Tem certeza que deseja excluir o acesso "${item.tool_name}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('company_access')
        .delete()
        .eq('id', item.id);

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

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(item);
    }
  };

  const AdminActions = () => (
    <>
      <DropdownMenuItem onClick={handleEdit}>
        <Edit className="mr-2 h-4 w-4" />
        Editar
      </DropdownMenuItem>
      <DropdownMenuItem 
        onClick={handleDelete}
        className="text-red-600 focus:text-red-600"
        disabled={isDeleting}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        {isDeleting ? 'Removendo...' : 'Remover'}
      </DropdownMenuItem>
    </>
  );

  const AccessCardContent = () => (
    <Card 
      className="hover:shadow-md transition-all duration-200 cursor-pointer group dark:hover:shadow-gray-800 relative overflow-hidden p-5 space-y-4"
      onClick={onClick}
      style={{
        borderColor: companyColor ? `${companyColor}30` : undefined,
        borderWidth: companyColor ? '1px' : undefined
      }}
    >
      <div 
        className="absolute top-0 left-0 w-full h-[2px] opacity-40"
        style={{ backgroundColor: companyColor }}
      />
      
      <CardHeader className="p-0 pb-2">
        <CardTitle className="flex justify-between items-center text-lg">
          <span className="dark:text-white font-semibold">{item.tool_name}</span>
          <div className="flex items-center gap-2">
            {item.url && (
              <a 
                href={item.url.startsWith('http') ? item.url : `https://${item.url}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={18} />
              </a>
            )}
            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <AdminActions />
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="flex items-center mb-4">
          <div className="bg-primary/10 p-2 rounded-full mr-3">
            <Key size={20} className="text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium dark:text-white">{item.username}</p>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-6 w-6 hover:bg-primary/10"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(item.username, 'Usuário');
                }}
              >
                <Copy size={14} />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">Usuário</p>
          </div>
        </div>

        <div className="border-t border-border/30 pt-3 mt-3">
          <p className="text-xs text-muted-foreground">
            Clique para ver a senha e mais detalhes
          </p>
        </div>
      </CardContent>
    </Card>
  );

  // If user is admin, wrap with context menu for right-click actions
  if (isAdmin) {
    return (
      <ContextMenu>
        <ContextMenuTrigger>
          <AccessCardContent />
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </ContextMenuItem>
          <ContextMenuItem 
            onClick={handleDelete}
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

  return <AccessCardContent />;
};
