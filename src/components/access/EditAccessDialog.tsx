
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AccessItem } from "./types";

interface EditAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accessItem: AccessItem | null;
  onAccessUpdated: () => void;
}

export const EditAccessDialog: React.FC<EditAccessDialogProps> = ({
  open,
  onOpenChange,
  accessItem,
  onAccessUpdated
}) => {
  const [formData, setFormData] = useState({
    tool_name: accessItem?.tool_name || '',
    username: accessItem?.username || '',
    password: accessItem?.password || '',
    url: accessItem?.url || '',
    notes: accessItem?.notes || ''
  });
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (accessItem) {
      setFormData({
        tool_name: accessItem.tool_name,
        username: accessItem.username,
        password: accessItem.password,
        url: accessItem.url || '',
        notes: accessItem.notes || ''
      });
    }
  }, [accessItem]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!accessItem) return;

    try {
      if (!formData.tool_name || !formData.username || !formData.password) {
        toast.error('Por favor, preencha todos os campos obrigatórios');
        return;
      }

      setLoading(true);

      const { error } = await supabase
        .from('company_access')
        .update({
          tool_name: formData.tool_name,
          username: formData.username,
          password: formData.password,
          url: formData.url || null,
          notes: formData.notes || null
        })
        .eq('id', accessItem.id);

      if (error) throw error;

      toast.success('Acesso atualizado com sucesso');
      onAccessUpdated();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating access:', error);
      toast.error(`Erro ao atualizar acesso: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Acesso</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label htmlFor="tool_name">Nome da Ferramenta *</Label>
            <Input 
              id="tool_name"
              name="tool_name"
              value={formData.tool_name} 
              onChange={handleInputChange} 
              required 
            />
          </div>
          <div>
            <Label htmlFor="url">URL</Label>
            <Input 
              id="url"
              name="url"
              value={formData.url} 
              onChange={handleInputChange} 
              placeholder="https://..." 
            />
          </div>
          <div>
            <Label htmlFor="username">Usuário *</Label>
            <Input 
              id="username"
              name="username"
              value={formData.username} 
              onChange={handleInputChange} 
              required 
            />
          </div>
          <div>
            <Label htmlFor="password">Senha *</Label>
            <Input 
              id="password"
              name="password"
              type="password" 
              value={formData.password} 
              onChange={handleInputChange} 
              required 
            />
          </div>
          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea 
              id="notes"
              name="notes"
              value={formData.notes} 
              onChange={handleInputChange} 
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
