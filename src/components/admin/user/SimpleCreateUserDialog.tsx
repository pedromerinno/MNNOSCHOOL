
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanies } from "@/hooks/useCompanies";
import { supabase } from "@/integrations/supabase/client";

interface SimpleCreateUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const SimpleCreateUserDialog: React.FC<SimpleCreateUserDialogProps> = ({
  isOpen,
  onOpenChange,
  onSuccess
}) => {
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const { userCompanies, forceGetUserCompanies, user } = useCompanies();
  const [isCreating, setIsCreating] = useState(false);
  const [createdInvite, setCreatedInvite] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    display_name: '',
    company_id: '',
  });

  // Verificar se o usuário tem permissão para criar convites
  const canCreateInvites = userProfile?.super_admin || userProfile?.is_admin;

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Informação copiada para a área de transferência",
    });
  };

  const handleSubmit = async () => {
    if (!canCreateInvites) {
      toast({
        title: "Erro de Permissão",
        description: "Você não possui permissões para criar convites.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.email || !formData.display_name || !formData.company_id) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      // Criar convite simples
      const inviteData = {
        email: formData.email.toLowerCase(),
        display_name: formData.display_name,
        company_id: formData.company_id,
        created_by: userProfile?.id,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
      };

      const { data: inviteRecord, error: inviteError } = await supabase
        .from('user_invites')
        .insert(inviteData)
        .select()
        .single();

      if (inviteError) {
        console.error('Erro ao criar convite:', inviteError);
        throw inviteError;
      }

      // Salvar dados do convite criado
      const selectedCompany = userCompanies.find(c => c.id === formData.company_id);
      setCreatedInvite({
        email: formData.email,
        display_name: formData.display_name,
        company: selectedCompany?.nome || 'Empresa',
        companyId: formData.company_id,
        inviteId: inviteRecord.id,
      });

      setShowSuccess(true);
      onSuccess();

      toast({
        title: "Convite Criado",
        description: "Convite criado com sucesso! Compartilhe as informações com o novo usuário.",
      });

    } catch (error: any) {
      console.error('Erro ao criar convite:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar convite.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setFormData({ email: '', display_name: '', company_id: '' });
    setCreatedInvite(null);
    setShowSuccess(false);
    onOpenChange(false);
  };

  // Se o usuário não tem permissão
  if (!canCreateInvites) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Acesso Negado</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-muted-foreground">
              Você não possui permissões para criar convites de usuários.
            </p>
          </div>

          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Tela de sucesso
  if (showSuccess && createdInvite) {
    const signupUrl = `${window.location.origin}/signup`;
    const inviteInfo = `
Convite para ${createdInvite.company}

Nome: ${createdInvite.display_name}
Email: ${createdInvite.email}
Código da Empresa: ${createdInvite.companyId}

Link de Cadastro: ${signupUrl}

Instruções:
1. Acesse o link de cadastro acima
2. Crie sua conta usando o email: ${createdInvite.email}
3. Após o cadastro, você será automaticamente vinculado à empresa
4. Se não for vinculado automaticamente, use o código da empresa: ${createdInvite.companyId}
    `.trim();

    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Convite Criado com Sucesso!</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Convite criado! Compartilhe as informações abaixo com o novo usuário:
            </p>
            
            <div className="relative">
              <Textarea
                value={inviteInfo}
                readOnly
                className="min-h-[200px] font-mono text-sm"
              />
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(inviteInfo)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>Importante:</strong> O usuário precisa se cadastrar usando exatamente o email fornecido. 
                Ele será automaticamente vinculado à empresa após o cadastro.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleClose}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Formulário principal
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Convite de Usuário</DialogTitle>
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isCreating || !formData.company_id || !formData.email || !formData.display_name}
          >
            {isCreating ? "Criando..." : "Criar Convite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
