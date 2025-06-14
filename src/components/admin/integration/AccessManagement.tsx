
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Edit, Key, Eye, EyeOff, Copy } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
        .from('company_access')
        .select('*')
        .eq('company_id', companyId)
        .order('tool_name');
      
      if (error) {
        console.error('Error fetching access items:', error);
        toast.error('Erro ao carregar itens de acesso');
        setAccessItems([]);
      } else {
        setAccessItems(data as AccessItem[] || []);
      }
    } catch (error: any) {
      console.error('Error fetching access items:', error);
      toast.error('Erro ao carregar itens de acesso');
      setAccessItems([]);
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

    try {
      if (!formData.tool_name || !formData.username || !formData.password) {
        toast.error('Por favor, preencha todos os campos obrigatórios');
        return;
      }

      if (currentAccess) {
        const { error } = await supabase
          .from('company_access')
          .update({
            tool_name: formData.tool_name,
            username: formData.username,
            password: formData.password,
            url: formData.url || null,
            notes: formData.notes || null
          })
          .eq('id', currentAccess.id);
        
        if (error) throw error;
        toast.success('Acesso atualizado com sucesso');
      } else {
        const { error } = await supabase
          .from('company_access')
          .insert({
            company_id: companyId,
            tool_name: formData.tool_name,
            username: formData.username,
            password: formData.password,
            url: formData.url || null,
            notes: formData.notes || null
          });
        
        if (error) throw error;
        toast.success('Acesso adicionado com sucesso');
        
        // Dispatch event to notify other components
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
      
      // Dispatch event to notify other components
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

  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Gestão de Acessos</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie os acessos compartilhados da empresa
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }} 
              className="rounded-xl py-[25px] px-[20px]"
              style={{ backgroundColor: companyColor }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Acesso
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {currentAccess ? 'Editar Acesso' : 'Novo Acesso'}
              </DialogTitle>
              <DialogDescription>
                {currentAccess ? 'Atualize as informações de acesso.' : 'Adicione um novo acesso compartilhado.'}
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
                    type="password" 
                    value={formData.password} 
                    onChange={handleInputChange} 
                    required 
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

      {accessItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Key className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground">
              Nenhum acesso foi cadastrado ainda.
            </p>
            <Button 
              onClick={() => setIsDialogOpen(true)} 
              variant="outline" 
              className="mt-4"
            >
              Adicionar primeiro acesso
            </Button>
          </CardContent>
        </Card>
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
                {accessItems.map((item) => (
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
                          size="sm"
                          onClick={() => copyToClipboard(item.username, 'Usuário copiado!')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>
                          {visiblePasswords.has(item.id) ? item.password : '••••••••'}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePasswordVisibility(item.id)}
                        >
                          {visiblePasswords.has(item.id) ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(item.password, 'Senha copiada!')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{item.notes || '-'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
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
