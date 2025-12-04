import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Plus, Trash2, Edit, Key, Eye, EyeOff, Search, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { UserAccessCardsView } from './UserAccessCardsView';
import { PasswordItem } from './PasswordCard';

type UserAccessItem = {
  id: string;
  user_id: string;
  tool_name: string;
  username: string;
  password: string;
  url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

interface UserAccessManagementProps {
  companyColor?: string;
  viewMode?: 'card' | 'table';
}

export const UserAccessManagement: React.FC<UserAccessManagementProps> = ({
  companyColor,
  viewMode = 'card'
}) => {
  const { user } = useAuth();
  const [accessItems, setAccessItems] = useState<UserAccessItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentAccess, setCurrentAccess] = useState<UserAccessItem | null>(null);
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
    if (user?.id) {
      fetchUserAccessItems();
    }
  }, [user?.id]);

  const fetchUserAccessItems = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // Use function to get passwords (plain text, no decryption needed)
      const { data, error } = await supabase
        .rpc('get_user_access_decrypted');
      
      if (error) throw error;
      
      // Transform the data to match the expected UserAccessItem format
      const transformedData = data?.map(item => ({
        id: item.id,
        user_id: item.user_id,
        tool_name: item.tool_name,
        username: item.username,
        password: item.password_decrypted || '', // Plain text password
        url: item.url,
        notes: item.notes,
        created_at: item.created_at,
        updated_at: item.updated_at
      })) || [];
      
      setAccessItems(transformedData as UserAccessItem[] || []);
    } catch (error: any) {
      console.error('Error fetching user access items:', error);
      toast.error('Erro ao carregar suas senhas pessoais');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      // Validação mais rigorosa - garantir que não sejam strings vazias
      const toolName = formData.tool_name?.trim();
      const username = formData.username?.trim();
      const password = formData.password?.trim();

      if (!toolName || !username || !password) {
        toast.error('Por favor, preencha todos os campos obrigatórios');
        return;
      }

      if (currentAccess) {
        // Update user access with plain text password (no encryption)
        const { error } = await supabase
          .from('user_access')
          .update({
            tool_name: toolName,
            username: username,
            password: password, // Plain text password
            url: formData.url?.trim() || null,
            notes: formData.notes?.trim() || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentAccess.id);
        
        if (error) throw error;
        toast.success('Senha pessoal atualizada com sucesso');
      } else {
        // Validação final antes de enviar - garantir que senha não seja null ou vazio
        if (!password || typeof password !== 'string' || password.trim().length === 0) {
          toast.error('A senha não pode estar vazia. Por favor, digite uma senha válida.');
          return;
        }

        // Garantir que a senha seja uma string válida
        const validPassword = password.trim();
        if (validPassword.length === 0) {
          toast.error('A senha não pode estar vazia. Por favor, digite uma senha válida.');
          return;
        }

        // Use create function (plain text password, no encryption)
        console.log('Creating user access with:', {
          tool_name: toolName,
          username: username,
          password_length: validPassword.length,
          has_url: !!formData.url,
          has_notes: !!formData.notes
        });

        const { data: newId, error } = await supabase
          .rpc('create_user_access', {
            p_tool_name: toolName,
            p_username: username,
            p_password: validPassword, // Plain text password
            p_url: formData.url?.trim() || null,
            p_notes: formData.notes?.trim() || null
          });
        
        if (error) {
          console.error('Error creating user access:', {
            error,
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
            parameters: {
              tool_name: toolName,
              username: username,
              password_length: validPassword.length
            }
          });
          throw error;
        }

        console.log('User access created successfully:', newId);
        toast.success('Senha pessoal adicionada com sucesso');
        
        // Disparar evento para atualizar contadores
        window.dispatchEvent(new CustomEvent('user-access-changed'));
      }

      setIsDialogOpen(false);
      resetForm();
      fetchUserAccessItems();
    } catch (error: any) {
      console.error('Error saving user access:', error);
      const errorMessage = error.message || 'Erro desconhecido ao salvar senha';
      toast.error(`Erro ao salvar senha: ${errorMessage}`);
    }
  };

  const handleEditItem = (accessItem: UserAccessItem) => {
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

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta senha pessoal?')) return;
    
    try {
      const { error } = await supabase
        .from('user_access')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Senha pessoal removida com sucesso');
      
      // Disparar evento para atualizar contadores
      window.dispatchEvent(new CustomEvent('user-access-changed'));
      
      fetchUserAccessItems();
    } catch (error: any) {
      console.error('Error deleting user access:', error);
      toast.error(`Erro ao excluir senha: ${error.message}`);
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

  const handleEditCard = (item: PasswordItem) => {
    const accessItem = accessItems.find(a => a.id === item.id);
    if (accessItem) {
      handleEditItem(accessItem);
    }
  };

  const handleDeleteCard = (item: PasswordItem) => {
    handleDeleteItem(item.id);
  };

  // Filtrar itens baseado no termo de busca
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) {
      return accessItems;
    }

    const term = searchTerm.toLowerCase().trim();
    return accessItems.filter(item => 
      item.tool_name.toLowerCase().includes(term) ||
      item.username.toLowerCase().includes(term) ||
      (item.url && item.url.toLowerCase().includes(term)) ||
      (item.notes && item.notes.toLowerCase().includes(term))
    );
  }, [accessItems, searchTerm]);

  // Convert UserAccessItem to PasswordItem
  const passwordItems: PasswordItem[] = filteredItems.map(item => ({
    id: item.id,
    tool_name: item.tool_name,
    username: item.username,
    password: item.password,
    url: item.url,
    notes: item.notes
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Minhas Senhas</h3>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(true);
                }} 
                className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white rounded-full px-6 py-2.5 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Adicionar Senha
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {currentAccess ? 'Editar Senha Pessoal' : 'Nova Senha Pessoal'}
                </DialogTitle>
                <DialogDescription>
                  {currentAccess ? 'Atualize suas informações de acesso.' : 'Adicione uma nova senha pessoal.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="tool_name">Nome da Ferramenta</Label>
                    <Input 
                      id="tool_name" 
                      name="tool_name" 
                      value={formData.tool_name} 
                      onChange={handleInputChange} 
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
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="username">Usuário</Label>
                    <Input 
                      id="username" 
                      name="username" 
                      value={formData.username} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input 
                      id="password" 
                      name="password" 
                      type="text" 
                      value={formData.password} 
                      onChange={handleInputChange} 
                      required 
                      placeholder="Digite a senha"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Input 
                      id="notes" 
                      name="notes" 
                      value={formData.notes} 
                      onChange={handleInputChange} 
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" style={{ backgroundColor: companyColor }}>
                    {currentAccess ? 'Atualizar' : 'Adicionar'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Filtros de busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por ferramenta, URL, usuário ou observações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10 w-full"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex justify-center w-full">
          <EmptyState
            title={searchTerm ? "Nenhum resultado encontrado" : "Você ainda não adicionou nenhuma senha pessoal"}
            description={searchTerm ? `Não foram encontradas senhas que correspondam a "${searchTerm}".` : "Comece adicionando sua primeira senha para gerenciá-las de forma segura e privada."}
            icons={[Key]}
            action={!searchTerm ? {
              label: "Adicionar primeira senha",
              onClick: () => {
                resetForm();
                setIsDialogOpen(true);
              }
            } : undefined}
          />
        </div>
      ) : viewMode === 'card' ? (
        <UserAccessCardsView
          items={passwordItems}
          companyColor={companyColor}
          onEdit={handleEditCard}
          onDelete={handleDeleteCard}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ferramenta</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Senha</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.tool_name}</TableCell>
                    <TableCell>
                      {item.url ? (
                        <a
                          href={item.url.startsWith('http') ? item.url : `https://${item.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center"
                        >
                          {item.url}
                        </a>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{item.username}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(item.username, 'Usuário copiado!')}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                          </svg>
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono">
                          {visiblePasswords.has(item.id) ? item.password : '••••••••'}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => togglePasswordVisibility(item.id)}
                        >
                          {visiblePasswords.has(item.id) ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(item.password, 'Senha copiada!')}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                          </svg>
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {item.notes || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEditItem(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
