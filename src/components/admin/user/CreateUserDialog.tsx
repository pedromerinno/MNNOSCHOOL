
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";

interface CreateUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CreateUserDialog: React.FC<CreateUserDialogProps> = ({
  isOpen,
  onOpenChange,
  onSuccess
}) => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [showInviteLink, setShowInviteLink] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    display_name: '',
    cidade: '',
    aniversario: '',
    data_inicio: '',
    tipo_contrato: '',
    nivel_colaborador: '',
    password: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleGeneratePassword = () => {
    const newPassword = generateRandomPassword();
    handleInputChange('password', newPassword);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Informação copiada para a área de transferência",
    });
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.display_name) {
      toast({
        title: "Erro",
        description: "Email e nome são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      // Gerar senha se não foi fornecida
      const password = formData.password || generateRandomPassword();

      // Criar usuário via Supabase Admin API
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: password,
        email_confirm: true,
        user_metadata: {
          display_name: formData.display_name,
        }
      });

      if (authError) {
        console.error('Erro ao criar usuário:', authError);
        toast({
          title: "Erro",
          description: authError.message || "Erro ao criar usuário",
          variant: "destructive",
        });
        return;
      }

      if (authData?.user) {
        // Atualizar perfil com informações adicionais
        const updateData: any = {
          display_name: formData.display_name,
          cidade: formData.cidade || null,
          tipo_contrato: formData.tipo_contrato || null,
          nivel_colaborador: formData.nivel_colaborador || null,
          primeiro_login: true,
        };

        if (formData.aniversario) {
          updateData.aniversario = formData.aniversario;
        }
        if (formData.data_inicio) {
          updateData.data_inicio = formData.data_inicio;
        }

        const { error: profileError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', authData.user.id);

        if (profileError) {
          console.error('Erro ao atualizar perfil:', profileError);
        }

        // Criar link de convite
        const baseUrl = window.location.origin;
        const inviteText = `
Olá ${formData.display_name}!

Você foi convidado(a) para acessar nossa plataforma.

Email: ${formData.email}
Senha temporária: ${password}

Acesse: ${baseUrl}/login

Por favor, altere sua senha no primeiro acesso.
        `.trim();

        setInviteLink(inviteText);
        setShowInviteLink(true);

        toast({
          title: "Sucesso",
          description: "Usuário criado com sucesso!",
        });

        onSuccess();
      }
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar usuário",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setFormData({
      email: '',
      display_name: '',
      cidade: '',
      aniversario: '',
      data_inicio: '',
      tipo_contrato: '',
      nivel_colaborador: '',
      password: '',
    });
    setInviteLink('');
    setShowInviteLink(false);
    onOpenChange(false);
  };

  if (showInviteLink) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Usuário Criado com Sucesso!</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Copie as informações abaixo e envie para o novo usuário:
            </p>
            
            <div className="relative">
              <Textarea
                value={inviteLink}
                readOnly
                className="min-h-[200px] font-mono text-sm"
              />
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(inviteLink)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleClose}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Usuário</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="email@exemplo.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_name">Nome Completo *</Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) => handleInputChange('display_name', e.target.value)}
              placeholder="Nome completo do usuário"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha Temporária</Label>
            <div className="flex gap-2">
              <Input
                id="password"
                type="text"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Deixe vazio para gerar automaticamente"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleGeneratePassword}
              >
                Gerar
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cidade">Cidade</Label>
            <Input
              id="cidade"
              value={formData.cidade}
              onChange={(e) => handleInputChange('cidade', e.target.value)}
              placeholder="Cidade onde mora"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="aniversario">Data de Aniversário</Label>
            <Input
              id="aniversario"
              type="date"
              value={formData.aniversario}
              onChange={(e) => handleInputChange('aniversario', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="data_inicio">Data de Início</Label>
            <Input
              id="data_inicio"
              type="date"
              value={formData.data_inicio}
              onChange={(e) => handleInputChange('data_inicio', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo_contrato">Tipo de Contrato</Label>
            <Select
              value={formData.tipo_contrato}
              onValueChange={(value) => handleInputChange('tipo_contrato', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de contrato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Não informado</SelectItem>
                <SelectItem value="CLT">CLT</SelectItem>
                <SelectItem value="PJ">PJ</SelectItem>
                <SelectItem value="Fornecedor">Fornecedor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nivel_colaborador">Nível do Colaborador</Label>
            <Select
              value={formData.nivel_colaborador}
              onValueChange={(value) => handleInputChange('nivel_colaborador', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Não informado</SelectItem>
                <SelectItem value="Junior">Junior</SelectItem>
                <SelectItem value="Pleno">Pleno</SelectItem>
                <SelectItem value="Senior">Senior</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isCreating}>
            {isCreating ? "Criando..." : "Criar Usuário"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
