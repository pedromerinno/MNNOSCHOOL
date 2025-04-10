
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Edit, Key } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { Company } from "@/types/company";
import { accessFormSchema } from "./form/IntegrationFormSchema";

// Define the AccessItem type explicitly
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
  company: Company;
}

export const AccessManagement: React.FC<AccessManagementProps> = ({ company }) => {
  const [accessItems, setAccessItems] = useState<AccessItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentAccess, setCurrentAccess] = useState<AccessItem | null>(null);
  const [formData, setFormData] = useState({
    tool_name: '',
    username: '',
    password: '',
    url: '',
    notes: ''
  });

  // Fetch access items when the component mounts or the company changes
  useEffect(() => {
    if (company) {
      fetchAccessItems();
    }
  }, [company.id]);

  const fetchAccessItems = async () => {
    setIsLoading(true);
    
    try {
      // Fixed: Using type assertion to handle the type issue
      const { data, error } = await supabase
        .from('company_access')
        .select('*')
        .eq('company_id', company.id)
        .order('tool_name');
      
      if (error) throw error;
      
      // Cast the data to the proper type
      setAccessItems(data as AccessItem[] || []);
    } catch (error: any) {
      console.error('Error fetching access items:', error);
      toast.error('Erro ao carregar informações de acesso');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form data
      const validationResult = accessFormSchema.safeParse(formData);
      if (!validationResult.success) {
        toast.error('Por favor, preencha todos os campos obrigatórios');
        return;
      }
      
      if (currentAccess) {
        // Update existing access - Using type assertion to handle the type
        const { error } = await supabase
          .from('company_access')
          .update({
            tool_name: formData.tool_name,
            username: formData.username,
            password: formData.password,
            url: formData.url || null,
            notes: formData.notes || null
          } as any)
          .eq('id', currentAccess.id);
          
        if (error) throw error;
        toast.success('Acesso atualizado com sucesso');
      } else {
        // Create new access - Using type assertion to handle the type
        const { error } = await supabase
          .from('company_access')
          .insert({
            company_id: company.id,
            tool_name: formData.tool_name,
            username: formData.username,
            password: formData.password,
            url: formData.url || null,
            notes: formData.notes || null
          } as any);
          
        if (error) throw error;
        toast.success('Acesso criado com sucesso');
      }
      
      // Reset and close
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
      // Using type assertion to handle the type
      const { error } = await supabase
        .from('company_access')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Acesso removido com sucesso');
      fetchAccessItems();
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
  
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };
  
  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success(message))
      .catch(() => toast.error('Falha ao copiar para a área de transferência'));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Gerenciar Acessos</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie logins e senhas das ferramentas utilizadas pela empresa
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Acesso
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {currentAccess ? 'Editar Acesso' : 'Novo Acesso'}
              </DialogTitle>
              <DialogDescription>
                {currentAccess 
                  ? 'Atualize as informações de acesso abaixo.'
                  : 'Adicione as informações de uma nova ferramenta.'}
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
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {currentAccess ? 'Atualizar' : 'Adicionar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : accessItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Key className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground">
              Não há informações de acesso cadastradas para esta empresa.
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
                          size="icon" 
                          className="h-6 w-6" 
                          onClick={() => copyToClipboard(item.username, 'Usuário copiado!')}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>••••••••</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6" 
                          onClick={() => copyToClipboard(item.password, 'Senha copiada!')}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-600"
                          onClick={() => handleDelete(item.id)}
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
