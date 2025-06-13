import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";

interface CreateUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const initialFormData = {
  email: '',
  display_name: '',
  cidade: '',
  aniversario: '',
  data_inicio: '',
  tipo_contrato: 'not_specified' as const,
  nivel_colaborador: 'not_specified' as const,
  password: '',
  company_id: '',
};

export const CreateUserDialog: React.FC<CreateUserDialogProps> = ({
  isOpen,
  onOpenChange,
  onSuccess
}) => {
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const { userCompanies, forceGetUserCompanies, user } = useCompanies();
  const [isCreating, setIsCreating] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [showInviteLink, setShowInviteLink] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  // Verificar se o usuário tem permissão para criar usuários
  const canCreateUsers = userProfile?.super_admin || userProfile?.is_admin;

  // Carregar empresas quando o diálogo abrir
  useEffect(() => {
    if (isOpen && user?.id && userCompanies.length === 0) {
      forceGetUserCompanies(user.id);
    }
  }, [isOpen, user?.id, userCompanies.length, forceGetUserCompanies]);

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
    // Verificar permissões
    if (!canCreateUsers) {
      toast({
        title: "Erro de Permissão",
        description: "Você não possui permissões suficientes para criar usuários. Entre em contato com um super administrador.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.email || !formData.display_name || !formData.company_id) {
      toast({
        title: "Erro",
        description: "Email, nome e empresa são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      // Gerar senha se não foi fornecida
      const password = formData.password || generateRandomPassword();

      // Encontrar a empresa selecionada
      const selectedCompany = userCompanies.find(company => company.id === formData.company_id);
      const companyName = selectedCompany?.nome || 'Empresa não encontrada';

      // Criar um convite personalizado com as informações do usuário
      const baseUrl = window.location.origin;
      const signupUrl = `${baseUrl}/signup`;
      
      const inviteText = `
Olá ${formData.display_name}!

Você foi convidado(a) para acessar nossa plataforma da empresa ${companyName}.

Email: ${formData.email}
Senha sugerida: ${password}

Para completar seu cadastro, acesse: ${signupUrl}

Use o email acima e crie sua senha no primeiro acesso.

Por favor, complete seu cadastro e entre em contato com um administrador para que sua conta seja vinculada à empresa ${companyName}.
      `.trim();

      setInviteLink(inviteText);
      setShowInviteLink(true);

      toast({
        title: "Convite Criado",
        description: "Convite criado com sucesso! Compartilhe as informações com o novo usuário.",
      });

      onSuccess();
    } catch (error: any) {
      console.error('Erro ao criar convite:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar convite para usuário.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setInviteLink('');
    setShowInviteLink(false);
    onOpenChange(false);
  };

  // Se o usuário não tem permissão, mostrar mensagem
  if (!canCreateUsers) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Acesso Negado</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-muted-foreground">
              Você não possui permissões suficientes para criar usuários. 
              Entre em contato com um super administrador.
            </p>
          </div>

          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (showInviteLink) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Convite Criado com Sucesso!</DialogTitle>
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
            <Label htmlFor="company_id">Empresa *</Label>
            <Select
              value={formData.company_id}
              onValueChange={(value) => handleInputChange('company_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma empresa" />
              </SelectTrigger>
              <SelectContent>
                {userCompanies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    <div className="flex items-center">
                      {company.logo && (
                        <img
                          src={company.logo}
                          alt={company.nome}
                          className="h-5 w-5 object-contain rounded mr-2"
                        />
                      )}
                      {company.nome}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {userCompanies.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Carregando empresas disponíveis...
              </p>
            )}
          </div>

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
            <Label htmlFor="password">Senha Sugerida</Label>
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
                <SelectItem value="not_specified">Não informado</SelectItem>
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
                <SelectItem value="not_specified">Não informado</SelectItem>
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
          <Button onClick={handleSubmit} disabled={isCreating || !formData.company_id}>
            {isCreating ? "Criando..." : "Criar Convite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
