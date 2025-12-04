import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AccessItem } from './types';
import { ExternalLink, Copy, Edit, Trash2, MoreVertical, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AccessTableViewProps {
  items: AccessItem[];
  onSelectAccess: (access: AccessItem) => void;
  onEdit?: (access: AccessItem) => void;
  onAccessUpdated?: () => void;
  companyColor?: string;
}

export const AccessTableView: React.FC<AccessTableViewProps> = ({
  items,
  onSelectAccess,
  onEdit,
  onAccessUpdated,
  companyColor
}) => {
  const { userProfile } = useAuth();
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const isAdmin = userProfile?.is_admin || userProfile?.super_admin;
  
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success(`${type} copiado para área de transferência`))
      .catch(() => toast.error('Falha ao copiar'));
  };

  const togglePasswordVisibility = (itemId: string) => {
    setVisiblePasswords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleDelete = async (item: AccessItem) => {
    if (!window.confirm(`Tem certeza que deseja excluir o acesso "${item.tool_name}"?`)) {
      return;
    }

    setDeletingIds(prev => new Set(prev).add(item.id));
    try {
      const { error } = await supabase
        .from('company_access')
        .delete()
        .eq('id', item.id);

      if (error) throw error;
      
      toast.success('Acesso removido com sucesso');
      window.dispatchEvent(new CustomEvent('access-created'));
      
      if (onAccessUpdated) {
        onAccessUpdated();
      }
    } catch (error: any) {
      console.error('Error deleting access:', error);
      toast.error(`Erro ao excluir acesso: ${error.message}`);
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }
  };

  const handleEdit = (item: AccessItem) => {
    if (onEdit) {
      onEdit(item);
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Ferramenta</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Usuário</TableHead>
            <TableHead>Senha</TableHead>
            <TableHead>Observações</TableHead>
            {(isAdmin || items.some(item => item.created_by === userProfile?.id)) && (
              <TableHead className="w-[100px] text-right">Ações</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const canEdit = isAdmin || item.created_by === userProfile?.id;
            const isPasswordVisible = visiblePasswords.has(item.id);
            const isDeleting = deletingIds.has(item.id);

            return (
              <TableRow 
                key={item.id}
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50"
                onClick={() => onSelectAccess(item)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span>{item.tool_name}</span>
                    {item.url && (
                      <a 
                        href={item.url.startsWith('http') ? item.url : `https://${item.url}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {item.url ? (
                    <a 
                      href={item.url.startsWith('http') ? item.url : `https://${item.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {item.url}
                    </a>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{item.username}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(item.username, 'Usuário');
                      }}
                    >
                      <Copy size={12} />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">
                      {isPasswordVisible ? item.password : '••••••••'}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePasswordVisibility(item.id);
                      }}
                    >
                      {isPasswordVisible ? (
                        <EyeOff size={12} />
                      ) : (
                        <Eye size={12} />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(item.password, 'Senha');
                      }}
                    >
                      <Copy size={12} />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {item.notes || '-'}
                  </span>
                </TableCell>
                {canEdit && (
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(item)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(item)}
                          className="text-red-600 focus:text-red-600"
                          disabled={isDeleting}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {isDeleting ? 'Removendo...' : 'Remover'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

