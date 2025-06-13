
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserProfile } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';

interface EditUserProfileDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile | null;
  onSuccess: () => void;
}

export const EditUserProfileDialog: React.FC<EditUserProfileDialogProps> = ({
  isOpen,
  onOpenChange,
  user,
  onSuccess
}) => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    display_name: user?.display_name || '',
    email: user?.email || '',
    cidade: user?.cidade || '',
    aniversario: user?.aniversario ? format(new Date(user.aniversario), 'yyyy-MM-dd') : '',
    data_inicio: user?.data_inicio ? format(new Date(user.data_inicio), 'yyyy-MM-dd') : '',
    tipo_contrato: user?.tipo_contrato || '',
    nivel_colaborador: user?.nivel_colaborador || '',
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        display_name: user.display_name || '',
        email: user.email || '',
        cidade: user.cidade || '',
        aniversario: user.aniversario ? format(new Date(user.aniversario), 'yyyy-MM-dd') : '',
        data_inicio: user.data_inicio ? format(new Date(user.data_inicio), 'yyyy-MM-dd') : '',
        tipo_contrato: user.tipo_contrato || '',
        nivel_colaborador: user.nivel_colaborador || '',
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!user?.id) return;

    setIsUpdating(true);
    try {
      const updateData: any = {
        display_name: formData.display_name,
        cidade: formData.cidade,
        tipo_contrato: formData.tipo_contrato || null,
        nivel_colaborador: formData.nivel_colaborador || null,
      };

      if (formData.aniversario) {
        updateData.aniversario = formData.aniversario;
      }
      if (formData.data_inicio) {
        updateData.data_inicio = formData.data_inicio;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar perfil do usuário",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Perfil do usuário atualizado com sucesso",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar perfil do usuário",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Perfil do Usuário</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="display_name">Nome</Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) => handleInputChange('display_name', e.target.value)}
              placeholder="Nome do usuário"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={formData.email}
              disabled
              className="bg-gray-100"
              placeholder="Email não pode ser alterado"
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isUpdating}>
            {isUpdating ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
