import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { useCompanyNotices, NoticeFormData } from "@/hooks/useCompanyNotices";
import { useCompanies } from "@/hooks/useCompanies";
import { HorizontalSettingsDialog, SettingsSection } from "@/components/ui/horizontal-settings-dialog";
import { NoticeFormFields } from "./NoticeFormFields";

interface NewNoticeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
  editingNoticeId?: string | null;
}

const NewNoticeDialog = ({ 
  open, 
  onOpenChange, 
  initialData, 
  editingNoticeId 
}: NewNoticeDialogProps) => {
  const { createNotice, updateNotice, fetchNotices } = useCompanyNotices();
  const { selectedCompany } = useCompanies();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formSchema = z.object({
    title: z.string().min(2, {
      message: "Título deve ter pelo menos 2 caracteres.",
    }),
    content: z.string().min(10, {
      message: "Conteúdo deve ter pelo menos 10 caracteres.",
    }),
    type: z.enum(['informativo', 'urgente', 'padrão']),
    data_inicio: z.string().nullable().optional(),
    data_fim: z.string().nullable().optional(),
  });

  const form = useForm<Omit<NoticeFormData, 'companies'>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      type: initialData?.type || "informativo",
    },
    mode: "onChange",
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          title: initialData.title || "",
          content: initialData.content || "",
          type: initialData.type || "informativo",
          data_inicio: initialData.data_inicio || null,
          data_fim: initialData.data_fim || null,
        });
      } else {
        form.reset({
          title: "",
          content: "",
          type: "informativo",
          data_inicio: null,
          data_fim: null,
        });
      }
    }
  }, [open, initialData, form]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setTimeout(() => {
        if (selectedCompany?.id) {
          fetchNotices(selectedCompany.id, true);
        }
        window.dispatchEvent(new CustomEvent('notices-updated'));
      }, 100);
    }
    onOpenChange(newOpen);
  };

  const handleFormSubmit = async () => {
    if (!selectedCompany?.id) {
      toast.error("Selecione uma empresa no menu superior.");
      return;
    }

    const isValid = await form.trigger();
    if (isValid) {
      setIsSubmitting(true);
      try {
        const formData = form.getValues();
        const noticeData: NoticeFormData = {
          ...formData,
          companies: [selectedCompany.id]
        };

        let success = false;
        if (editingNoticeId) {
          success = await updateNotice(editingNoticeId, noticeData);
          if (success) {
            toast.success("Aviso atualizado com sucesso");
            onOpenChange(false);
          }
        } else {
          success = await createNotice(noticeData);
          if (success) {
            toast.success("Aviso criado com sucesso");
            onOpenChange(false);
          }
        }
      } catch (error) {
        console.error("Erro ao salvar aviso:", error);
        toast.error("Erro ao salvar aviso");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const isFormValid = () => {
    return form.formState.isValid && !!selectedCompany?.id;
  };

  const sections: SettingsSection[] = useMemo(() => {
    return [
      {
        id: 'general',
        label: 'Geral',
        content: (
          <div className="space-y-6">
            <NoticeFormFields form={form} />
          </div>
        )
      }
    ];
  }, [form]);

  const companyColor = selectedCompany?.cor_principal || "#1EAEDB";

  return (
    <Form {...form}>
      <HorizontalSettingsDialog
        open={open}
        onOpenChange={handleOpenChange}
        title={editingNoticeId ? "Editar Aviso" : "Novo Aviso"}
        sections={sections}
        defaultSectionId="general"
        onCancel={() => handleOpenChange(false)}
        onSave={handleFormSubmit}
        saveLabel={editingNoticeId ? "Salvar Alterações" : "Criar Aviso"}
        cancelLabel="Cancelar"
        isSaving={isSubmitting}
        isFormValid={isFormValid()}
        saveButtonStyle={isFormValid() ? { 
          backgroundColor: companyColor,
          borderColor: companyColor
        } : undefined}
        maxWidth="max-w-2xl"
      />
    </Form>
  );
};

export default NewNoticeDialog;
