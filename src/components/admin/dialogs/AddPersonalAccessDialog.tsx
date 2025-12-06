import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AddPersonalAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccessUpdated?: () => void;
}

export const AddPersonalAccessDialog: React.FC<AddPersonalAccessDialogProps> = ({
  open,
  onOpenChange,
  onAccessUpdated
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    tool_name: '',
    username: '',
    password: '',
    url: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      const toolName = formData.tool_name?.trim();
      const username = formData.username?.trim();
      const password = formData.password?.trim();

      if (!toolName || !username || !password) {
        toast.error('Por favor, preencha todos os campos obrigatórios');
        return;
      }

      if (!password || typeof password !== 'string' || password.trim().length === 0) {
        toast.error('A senha não pode estar vazia. Por favor, digite uma senha válida.');
        return;
      }

      setLoading(true);

      const { data: newId, error } = await supabase
        .rpc('create_user_access', {
          p_tool_name: toolName,
          p_username: username,
          p_password: password.trim(),
          p_url: formData.url?.trim() || null,
          p_notes: formData.notes?.trim() || null
        });

      if (error) throw error;

      toast.success('Senha pessoal criada com sucesso');
      
      window.dispatchEvent(new CustomEvent('user-access-changed'));
      
      if (onAccessUpdated) {
        onAccessUpdated();
      }
      
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      console.error('Error creating personal access:', error);
      toast.error(`Erro ao criar senha pessoal: ${error.message}`);
    } finally {
      setLoading(false);
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
  };

  const isFormValid = () => {
    return !!(formData.tool_name?.trim() && formData.username?.trim() && formData.password?.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Senha Pessoal</DialogTitle>
          <DialogDescription>
            Adicione uma nova senha pessoal para suas ferramentas.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="personal-tool-name">Nome da Ferramenta *</Label>
            <Input
              id="personal-tool-name"
              name="tool_name"
              value={formData.tool_name}
              onChange={handleInputChange}
              placeholder="Ex: GitHub, Slack, etc."
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="personal-url">URL</Label>
            <Input
              id="personal-url"
              name="url"
              value={formData.url}
              onChange={handleInputChange}
              placeholder="https://..."
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="personal-username">Usuário *</Label>
            <Input
              id="personal-username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="personal-password">Senha *</Label>
            <Input
              id="personal-password"
              name="password"
              type="text"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Digite a senha"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="personal-notes">Observações</Label>
            <Textarea
              id="personal-notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Informações adicionais sobre este acesso..."
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isFormValid() || loading}
            className="bg-black hover:bg-gray-800 text-white"
          >
            {loading ? 'Salvando...' : 'Adicionar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
