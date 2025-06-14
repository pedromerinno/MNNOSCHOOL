
import React, { useState } from 'react';
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
  const { userCompanies } = useCompanies();
  const [showInviteText, setShowInviteText] = useState(false);
  const [inviteText, setInviteText] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    display_name: '',
    company_id: '',
  });

  // Verificar se o usuário tem permissão para criar convites
  const canCreateInvites = userProfile?.super_admin || userProfile?.is_admin;

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
      description: "Texto do convite copiado para a área de transferência",
    });
  };

  const generateInviteText = () => {
    if (!formData.email || !formData.display_name || !formData.company_id) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const selectedCompany = userCompanies.find(c => c.id === formData.company_id);
    const signupUrl = `${window.location.origin}/signup`;
    
    const inviteMessage = `🎉 Convite para ${selectedCompany?.nome || 'nossa empresa'}

Olá ${formData.display_name}!

Você foi convidado(a) para fazer parte da nossa plataforma de gestão educacional e empresarial.

📧 Email para cadastro: ${formData.email}
🏢 Código da Empresa: ${formData.company_id}
🔗 Link de Cadastro: ${signupUrl}

📋 INSTRUÇÕES PARA CADASTRO:

1. Acesse o link de cadastro acima
2. Crie sua conta usando exatamente o email: ${formData.email}
3. Após o cadastro, você será automaticamente vinculado à empresa
4. Caso não seja vinculado automaticamente, use o código da empresa: ${formData.company_id}

⚠️ IMPORTANTE:
- Use exatamente o email fornecido para garantir a vinculação automática
- Mantenha o código da empresa em local seguro
- Em caso de dúvidas, entre em contato conosco

Bem-vindo(a) à ${selectedCompany?.nome || 'nossa empresa'}! 🚀`;

    setInviteText(inviteMessage);
    setShowInviteText(true);
    onSuccess();

    toast({
      title: "Convite Gerado",
      description: "Texto do convite foi gerado com sucesso! Copie e compartilhe com o novo usuário.",
    });
  };

  const handleClose = () => {
    setFormData({ email: '', display_name: '', company_id: '' });
    setInviteText('');
    setShowInviteText(false);
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

  // Tela com o texto do convite gerado
  if (showInviteText) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Convite Gerado com Sucesso!</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Copie o texto abaixo e compartilhe com o novo usuário:
            </p>
            
            <div className="relative">
              <Textarea
                value={inviteText}
                readOnly
                className="min-h-[300px] font-mono text-sm resize-none"
              />
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(inviteText)}
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
            <Button 
              variant="outline" 
              onClick={() => {
                setShowInviteText(false);
                setInviteText('');
                setFormData({ email: '', display_name: '', company_id: '' });
              }}
            >
              Criar Novo Convite
            </Button>
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
          <DialogTitle>Gerar Convite de Usuário</DialogTitle>
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

          <div className="bg-yellow-50 p-3 rounded-md">
            <p className="text-sm text-yellow-700">
              <strong>Nota:</strong> Isso gerará apenas um texto de convite para ser compartilhado. 
              Nenhum registro será criado no banco de dados.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={generateInviteText} 
            disabled={!formData.company_id || !formData.email || !formData.display_name}
          >
            Gerar Convite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
