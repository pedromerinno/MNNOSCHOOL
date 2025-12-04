
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Edit, Key, Eye, EyeOff, Copy, MoreHorizontal, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminTable, AdminTableColumn } from '@/components/admin/AdminTable';
import { AdminFilterBar, FilterConfig } from '@/components/admin/AdminFilterBar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

type AccessItem = {
  id: string;
  company_id: string;
  tool_name: string;
  username: string;
  password: string;
  url: string | null;
  notes: string | null;
  created_at: string;
};

interface AccessManagementProps {
  companyId: string;
  companyColor?: string;
}

export const AccessManagement: React.FC<AccessManagementProps> = ({
  companyId,
  companyColor = "#1EAEDB"
}) => {
  const [accessItems, setAccessItems] = useState<AccessItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentAccess, setCurrentAccess] = useState<AccessItem | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    tool_name: '',
    username: '',
    password: '',
    url: '',
    notes: ''
  });

  useEffect(() => {
    if (companyId) {
      fetchAccessItems();
    }
  }, [companyId]);

  const fetchAccessItems = async () => {
    if (!companyId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('get_company_access_decrypted', { p_company_id: companyId });
      
      if (error) {
        console.error('Error fetching access items:', error);
        toast.error('Erro ao carregar itens de acesso');
        setAccessItems([]);
      } else {
        const transformedData = data?.map(item => ({
          id: item.id,
          company_id: item.company_id,
          tool_name: item.tool_name,
          username: item.username,
          password: item.password_decrypted,
          url: item.url,
          notes: item.notes,
          created_at: item.created_at
        })) || [];
        
        setAccessItems(transformedData as AccessItem[] || []);
      }
    } catch (error: any) {
      console.error('Error fetching access items:', error);
      toast.error('Erro ao carregar itens de acesso');
      setAccessItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return accessItems;

    const term = searchTerm.toLowerCase();
    return accessItems.filter(item =>
      item.tool_name?.toLowerCase().includes(term) ||
      item.username?.toLowerCase().includes(term) ||
      item.url?.toLowerCase().includes(term) ||
      item.notes?.toLowerCase().includes(term)
    );
  }, [accessItems, searchTerm]);

  const filterConfigs: FilterConfig[] = [
    {
      type: 'text',
      id: 'search',
      placeholder: 'Buscar por ferramenta, usuário, URL ou observações...',
      value: searchTerm,
      onChange: setSearchTerm
    }
  ];

  const hasActiveFilters = searchTerm.trim().length > 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!formData.tool_name || !formData.username || !formData.password) {
        toast.error('Por favor, preencha todos os campos obrigatórios');
        return;
      }

      if (currentAccess) {
        const { data: updated, error } = await supabase
          .rpc('update_company_access', {
            p_id: currentAccess.id,
            p_tool_name: formData.tool_name,
            p_username: formData.username,
            p_password: formData.password,
            p_url: formData.url || null,
            p_notes: formData.notes || null
          });
        
        if (error) throw error;
        toast.success('Acesso atualizado com sucesso');
      } else {
        const { data: newId, error } = await supabase
          .rpc('create_company_access', {
            p_company_id: companyId,
            p_tool_name: formData.tool_name,
            p_username: formData.username,
            p_password: formData.password,
            p_url: formData.url || null,
            p_notes: formData.notes || null
          });
        
        if (error) throw error;
        toast.success('Acesso adicionado com sucesso');
        window.dispatchEvent(new CustomEvent('access-created'));
      }

      setIsDialogOpen(false);
      resetForm();
      fetchAccessItems();
    } catch (error: any) {
      console.error('Error saving access:', error);
      toast.error(`Erro ao salvar acesso: ${error.message}`);
    }
  };

  const handleEdit = (accessItem: AccessItem) => {
    setCurrentAccess(accessItem);
    setFormData({
      tool_name: accessItem.tool_name,
      username: accessItem.username,
      password: accessItem.password,
      url: accessItem.url || '',
      notes: accessItem.notes || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este acesso?')) return;
    
    try {
      const { error } = await supabase
        .from('company_access')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Acesso removido com sucesso');
      fetchAccessItems();
      window.dispatchEvent(new CustomEvent('access-created'));
    } catch (error: any) {
      console.error('Error deleting access:', error);
      toast.error(`Erro ao excluir acesso: ${error.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      tool_name: '',
      username: '',
      password: '',
      url: '',
      notes: ''
    });
    setCurrentAccess(null);
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success(message))
      .catch(() => toast.error('Falha ao copiar para a área de transferência'));
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

  const columns: AdminTableColumn<AccessItem>[] = [
    {
      id: 'tool_name',
      header: 'Ferramenta',
      accessor: 'tool_name',
      sortable: false,
      cell: (item) => (
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-gray-400" />
          <span className="font-medium">{item.tool_name}</span>
        </div>
      )
    },
    {
      id: 'url',
      header: 'URL',
      accessor: 'url',
      sortable: false,
      cell: (item) => {
        if (!item.url) return <span className="text-gray-400">-</span>;
        
        const url = item.url.startsWith('http') ? item.url : `https://${item.url}`;
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1.5 hover:underline max-w-xs truncate"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="truncate">{item.url}</span>
                  <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>{url}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
      responsive: {
        hideBelow: 'lg'
      }
    },
    {
      id: 'username',
      header: 'Usuário',
      accessor: 'username',
      sortable: false,
      cell: (item) => (
        <div className="flex items-center gap-2">
          <span>{item.username}</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(item.username, 'Usuário copiado!');
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copiar usuário</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )
    },
    {
      id: 'password',
      header: 'Senha',
      sortable: false,
      cell: (item) => {
        const isVisible = visiblePasswords.has(item.id);
        return (
          <div className="flex items-center gap-2">
            <code className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              {isVisible ? item.password : '••••••••'}
            </code>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePasswordVisibility(item.id);
                    }}
                  >
                    {isVisible ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isVisible ? 'Ocultar senha' : 'Mostrar senha'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(item.password, 'Senha copiada!');
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copiar senha</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      }
    },
    {
      id: 'notes',
      header: 'Observações',
      accessor: 'notes',
      sortable: false,
      cell: (item) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {item.notes || <span className="text-gray-400">-</span>}
        </span>
      ),
      responsive: {
        hideBelow: 'xl'
      }
    },
    {
      id: 'actions',
      header: '',
      sortable: false,
      align: 'right',
      className: 'w-12',
      cell: (item) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              handleEdit(item);
            }}>
              <Edit className="h-4 w-4 mr-2" />
              Editar acesso
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(item.id);
              }}
              className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir acesso
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Barra de Filtros e Botão */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <AdminFilterBar
            filters={filterConfigs}
            companyColor={companyColor}
            showClearButton={true}
            onClear={() => setSearchTerm('')}
            hasActiveFilters={hasActiveFilters}
            resultsCount={{
              current: filteredItems.length,
              total: accessItems.length,
              label: 'acesso',
              showTotalWhenFiltered: true
            }}
          />
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
          className="bg-black hover:bg-gray-800 text-white rounded-xl whitespace-nowrap"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Acesso
        </Button>
      </div>

      {/* Tabela */}
      <AdminTable
        data={filteredItems}
        columns={columns}
        loading={isLoading}
        getRowKey={(item) => item.id}
        emptyState={{
          icon: Key,
          title: hasActiveFilters ? 'Nenhum acesso encontrado' : 'Nenhum acesso cadastrado',
          description: hasActiveFilters
            ? 'Tente ajustar os filtros para encontrar acessos'
            : 'Adicione seu primeiro acesso para começar a gerenciar as senhas da empresa.'
        }}
      />

      {/* Dialog para criar/editar */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentAccess ? 'Editar Acesso' : 'Novo Acesso'}
            </DialogTitle>
            <DialogDescription>
              {currentAccess 
                ? 'Atualize as informações de acesso compartilhado.' 
                : 'Adicione um novo acesso compartilhado para a empresa.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="tool_name">
                  Nome da Ferramenta <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="tool_name" 
                  name="tool_name" 
                  value={formData.tool_name} 
                  onChange={handleInputChange} 
                  placeholder="Ex: GitHub, AWS, Slack..."
                  required 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="url">URL</Label>
                <Input 
                  id="url" 
                  name="url" 
                  value={formData.url} 
                  onChange={handleInputChange} 
                  placeholder="https://..." 
                  type="url"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">
                    Usuário <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="username" 
                    name="username" 
                    value={formData.username} 
                    onChange={handleInputChange} 
                    placeholder="usuário@exemplo.com"
                    required 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="password">
                    Senha <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="password" 
                    name="password" 
                    type="password" 
                    value={formData.password} 
                    onChange={handleInputChange} 
                    placeholder="••••••••"
                    required 
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea 
                  id="notes" 
                  name="notes" 
                  value={formData.notes} 
                  onChange={handleInputChange} 
                  placeholder="Informações adicionais sobre este acesso..."
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                style={{ backgroundColor: companyColor }}
                className="text-white hover:opacity-90"
              >
                {currentAccess ? 'Atualizar' : 'Adicionar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
