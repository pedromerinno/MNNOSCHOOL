import React, { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useCompanies } from "@/hooks/useCompanies";
import { useCompanyUsers } from "@/hooks/company-documents/useCompanyUsers";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { HorizontalSettingsDialog, SettingsSection } from "@/components/ui/horizontal-settings-dialog";
import { getInitials } from "@/utils/stringUtils";

interface NewFeedbackDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export const NewFeedbackDialog: React.FC<NewFeedbackDialogProps> = ({ open, onOpenChange }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [loading, setLoading] = useState(false);
  const { selectedCompany } = useCompanies();
  const { users: companyUsers, isLoading: isLoadingUsers } = useCompanyUsers();
  const { user: authUser } = useAuth();

  useEffect(() => {
    if (open) {
      setTitle('');
      setContent('');
      setRecipientId('');
    }
  }, [open]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Por favor, preencha o título do feedback.");
      return;
    }

    if (!content.trim()) {
      toast.error("Por favor, preencha o conteúdo do feedback.");
      return;
    }

    if (!recipientId) {
      toast.error("Por favor, selecione um colaborador.");
      return;
    }

    if (!selectedCompany?.id) {
      toast.error("Nenhuma empresa selecionada.");
      return;
    }

    if (!authUser?.id) {
      toast.error("Usuário não autenticado.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('feedbacks')
        .insert({
          admin_id: authUser.id,
          recipient_id: recipientId,
          company_id: selectedCompany.id,
          title: title.trim(),
          content: content.trim()
        });

      if (error) throw error;

      toast.success("Feedback criado com sucesso.");
      setTitle('');
      setContent('');
      setRecipientId('');
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating feedback:', error);
      toast.error(error.message || "Erro ao criar feedback.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return !!title.trim() && !!content.trim() && !!recipientId && !!selectedCompany?.id;
  };

  const selectedRecipient = useMemo(() => {
    return companyUsers.find(u => u.id === recipientId);
  }, [companyUsers, recipientId]);

  // Buscar avatares dos usuários
  const [userAvatars, setUserAvatars] = useState<Record<string, string | null>>({});

  useEffect(() => {
    const fetchAvatars = async () => {
      if (companyUsers.length === 0) return;

      const userIds = companyUsers.map(u => u.id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, avatar')
        .in('id', userIds);

      if (profiles) {
        const avatarsMap: Record<string, string | null> = {};
        profiles.forEach(profile => {
          avatarsMap[profile.id] = profile.avatar;
        });
        setUserAvatars(avatarsMap);
      }
    };

    fetchAvatars();
  }, [companyUsers]);

  const sections: SettingsSection[] = useMemo(() => {
    return [
      {
        id: 'general',
        label: 'Geral',
        content: (
          <div className="space-y-6">
            <div>
              <Label htmlFor="collaborator">Colaborador</Label>
              <Select 
                value={recipientId} 
                onValueChange={setRecipientId}
                disabled={!selectedCompany?.id || isLoadingUsers}
              >
                <SelectTrigger id="collaborator" className="mt-2">
                  <SelectValue placeholder={isLoadingUsers ? "Carregando..." : "Selecione um colaborador"}>
                    {selectedRecipient && (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={userAvatars[selectedRecipient.id] || undefined} />
                          <AvatarFallback className="text-xs">
                            {getInitials(selectedRecipient.display_name || '')}
                          </AvatarFallback>
                        </Avatar>
                        <span>{selectedRecipient.display_name}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {companyUsers.length === 0 && !isLoadingUsers ? (
                    <div className="px-2 py-1.5 text-sm text-gray-500">
                      Nenhum colaborador encontrado
                    </div>
                  ) : (
                    companyUsers.map((collaborator) => (
                      <SelectItem key={collaborator.id} value={collaborator.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={userAvatars[collaborator.id] || undefined} />
                            <AvatarFallback className="text-xs">
                              {getInitials(collaborator.display_name || '')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span>{collaborator.display_name}</span>
                            {collaborator.job_role?.title && (
                              <span className="text-xs text-gray-500">
                                {collaborator.job_role.title}
                              </span>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">Título</Label>
              <Input 
                id="title"
                value={title} 
                onChange={e => setTitle(e.target.value)}
                placeholder="Título curto do feedback"
                maxLength={100}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="content">Feedback</Label>
              <Textarea 
                id="content"
                value={content} 
                onChange={e => setContent(e.target.value)}
                placeholder="Descreva o feedback para o colaborador"
                rows={6}
                className="mt-2"
              />
            </div>
          </div>
        )
      }
    ];
  }, [selectedCompany, recipientId, companyUsers, title, content, selectedRecipient, userAvatars, isLoadingUsers]);

  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";

  return (
    <HorizontalSettingsDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Novo Feedback"
      sections={sections}
      defaultSectionId="general"
      onCancel={() => onOpenChange(false)}
      onSave={handleSave}
      saveLabel="Adicionar Feedback"
      cancelLabel="Cancelar"
      isSaving={loading}
      isFormValid={isFormValid()}
      saveButtonStyle={isFormValid() ? { 
        backgroundColor: companyColor,
        borderColor: companyColor
      } : undefined}
      maxWidth="max-w-2xl"
    />
  );
};
