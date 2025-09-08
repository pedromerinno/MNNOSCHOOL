
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useCompanies } from "@/hooks/useCompanies";
import { supabase } from "@/integrations/supabase/client";

interface NewAccessDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export const NewAccessDialog: React.FC<NewAccessDialogProps> = ({ open, onOpenChange }) => {
  const [tool_name, setToolName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Use hook with forced refresh to ensure companies are loaded
  const { selectedCompany, userCompanies, selectCompany, user, isLoading, forceGetUserCompanies } = useCompanies();

  console.log('[NewAccessDialog] Companies data:', {
    userCompaniesCount: userCompanies.length,
    selectedCompany: selectedCompany?.nome || 'none',
    isLoading,
    userId: user?.id || 'no user'
  });

  // Force reload companies when dialog opens
  React.useEffect(() => {
    if (open && user?.id && userCompanies.length === 0 && !isLoading) {
      console.log('[NewAccessDialog] Dialog opened, forcing companies refresh');
      forceGetUserCompanies(user.id);
    }
  }, [open, user?.id, userCompanies.length, isLoading, forceGetUserCompanies]);

  const handleCompanyChange = (companyId: string) => {
    const company = userCompanies.find(c => c.id === companyId);
    if (company && user?.id) {
      selectCompany(user.id, company);
    }
  };

  const resetForm = () => {
    setToolName("");
    setUsername("");
    setPassword("");
    setUrl("");
    setNotes("");
  };

  const handleSave = async () => {
    try {
      if (!tool_name || !username || !password) {
        toast.error('Por favor, preencha todos os campos obrigatórios');
        return;
      }

      if (!selectedCompany?.id) {
        toast.error('Por favor, selecione uma empresa');
        return;
      }

      if (!user?.id) {
        toast.error('Usuário não autenticado');
        return;
      }

      setLoading(true);

      // Use new encrypted function instead of direct table access
      const { data: newId, error } = await supabase
        .rpc('create_company_access', {
          p_company_id: selectedCompany.id,
          p_tool_name: tool_name,
          p_username: username,
          p_password: password,
          p_url: url || null,
          p_notes: notes || null
        });

      if (error) throw error;

      toast.success("Acesso criado com sucesso.");
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('access-created'));
      
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      console.error('Error saving access:', error);
      toast.error(`Erro ao criar acesso: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Senha de Acesso</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <Label>Empresa</Label>
          <Select 
            value={selectedCompany?.id || ""} 
            onValueChange={handleCompanyChange}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={
                isLoading ? "Carregando empresas..." : 
                userCompanies.length === 0 ? "Clique para carregar empresas" :
                "Selecione uma empresa"
              } />
            </SelectTrigger>
            <SelectContent>
              {userCompanies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  <div className="flex items-center">
                    {company.logo && (
                      <img
                        src={company.logo}
                        alt={company.nome}
                        className="h-6 w-6 object-contain rounded-full mr-2"
                      />
                    )}
                    <span>{company.nome}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {userCompanies.length === 0 && !isLoading && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground">
                Nenhuma empresa encontrada. Verifique suas permissões.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => user?.id && forceGetUserCompanies(user.id)}
                className="mt-1"
              >
                Tentar carregar novamente
              </Button>
            </div>
          )}
        </div>
        <div className="space-y-3 py-2">
          <div>
            <Label>Nome da Ferramenta *</Label>
            <Input value={tool_name} onChange={e => setToolName(e.target.value)} />
          </div>
          <div>
            <Label>Usuário *</Label>
            <Input value={username} onChange={e => setUsername(e.target.value)} />
          </div>
          <div>
            <Label>Senha *</Label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div>
            <Label>URL</Label>
            <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <Label>Observações</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Salvando..." : "Adicionar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
