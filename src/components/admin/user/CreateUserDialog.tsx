
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
  const [createdInvite, setCreatedInvite] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Informação copiada para a área de transferência",
    });
  };

  const handleSubmit = async () => {
    if (!canCreateUsers) {
      toast({
        title: "Erro de Permissão",
        description: "Você não possui permissões suficientes para criar usuários.",
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

    // Usar diretamente o ID do perfil do contexto, sem chamar supabase.auth.getUser()
    if (!userProfile?.id) {
      toast({
        title: "Erro",
        description: "Usuário não identificado. Por favor, faça login novamente.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      // Criar dados do convite no banco de dados
      const inviteData = {
        email: formData.email.toLowerCase(),
        display_name: formData.display_name,
        company_id: formData.company_id,
        cidade: formData.cidade || null,
        aniversario: formData.aniversario || null,
        data_inicio: formData.data_inicio || null,
        tipo_contrato: formData.tipo_contrato !== 'not_specified' ? formData.tipo_contrato : null,
        nivel_colaborador: formData.nivel_colaborador !== 'not_specified' ? formData.nivel_colaborador : null,
        created_by: userProfile.id, // Usar diretamente do contexto
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
      };

      console.log('Criando convite:', inviteData);

      // Salvar convite no banco
      const { data: inviteRecord, error: inviteError } = await supabase
        .from('user_invites')
        .insert(inviteData)
        .select()
        .single();

      if (inviteError) {
        console.error('Erro ao criar convite:', inviteError);
        throw inviteError;
      }

      console.log('Convite salvo:', inviteRecord);

      // Salvar dados do convite criado para mostrar no sucesso
      setCreatedInvite({
        email: formData.email,
        display_name: formData.display_name,
        company: userCompanies.find(c => c.id === formData.company_id)?.nome || 'Empresa',
        inviteId: inviteRecord.id,
      });

      setShowSuccess(true);
      onSuccess();

      toast({
        title: "Convite Criado",
        description: "Convite criado com sucesso! O usuário poderá se cadastrar usando o email fornecido e será automaticamente vinculado à empresa.",
      });

    } catch (error: any) {
      console.error('Erro ao criar convite:', error);
      
      // Tratar erro de permissão especificamente
      if (error.message?.includes('permission denied') || error.message?.includes('insufficient_privilege')) {
        toast({
          title: "Erro de Permissão",
          description: "Você não tem permissões suficientes para criar convites. Verifique se você é administrador.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro",
          description: error.message || "Erro ao criar convite.",
          variant: "destructive",
        });
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setCreatedInvite(null);
    setShowSuccess(false);
    onOpenChange(false);
  };

  // Se o usuário não tem permissão
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
    const loginInfo = `
Convite Criado - ${createdInvite.company}

Nome: ${createdInvite.display_name}
Email: ${createdInvite.email}

Link da plataforma: https://school.merinno.com/signup

Instruções:
1. O usuário deve acessar o link acima
2. Fazer cadastro usando EXATAMENTE o email: ${createdInvite.email}
3. Definir sua própria senha no cadastro
4. Após o cadastro, as informações do perfil e a vinculação à empresa serão aplicadas automaticamente
    `.trim();

    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Convite Criado com Sucesso!</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Convite criado! Compartilhe as informações abaixo:
            </p>
            
            <div className="relative">
              <Textarea
                value={loginInfo}
                readOnly
                className="min-h-[200px] font-mono text-sm"
              />
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(loginInfo)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>Importante:</strong> O usuário precisa se cadastrar usando EXATAMENTE o email fornecido. 
                As informações do perfil e a vinculação à empresa serão aplicadas automaticamente após o cadastro.
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
