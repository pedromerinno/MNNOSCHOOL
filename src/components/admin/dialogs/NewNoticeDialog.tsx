
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { useCompanyNotices, NoticeFormData } from "@/hooks/useCompanyNotices";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCompanies } from "@/hooks/useCompanies";

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
  const { toast } = useToast();
  const { createNotice, updateNotice, fetchNotices } = useCompanyNotices();
  const { userCompanies, selectedCompany } = useCompanies();
  const [submitting, setSubmitting] = useState(false);

  const formSchema = z.object({
    title: z.string().min(2, {
      message: "Título deve ter pelo menos 2 caracteres.",
    }),
    content: z.string().min(10, {
      message: "Conteúdo deve ter pelo menos 10 caracteres.",
    }),
    type: z.enum(['informativo', 'urgente', 'padrão']),
    companies: z.array(z.string()).min(1, {
      message: "Selecione pelo menos uma empresa."
    }),
  });

  const form = useForm<NoticeFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      type: initialData?.type || "informativo",
      companies: initialData?.companies || (selectedCompany ? [selectedCompany.id] : []),
    },
    mode: "onChange",
  });

  const { reset, setValue } = form;

  // Simplificamos o useEffect para configurar o formulário quando o diálogo é aberto
  useEffect(() => {
    if (open) {
      if (initialData) {
        // Configuração do formulário para edição
        Object.keys(initialData).forEach(key => {
          if (key === 'companies' && Array.isArray(initialData[key])) {
            setValue(key as keyof NoticeFormData, initialData[key]);
          } else if (key === 'title' || key === 'content' || key === 'type') {
            setValue(key as keyof NoticeFormData, initialData[key]);
          }
        });
      } else if (selectedCompany) {
        // Para novo aviso, pré-selecionar empresa atual
        setValue("companies", [selectedCompany.id]);
      }
    } else {
      // Reset do formulário quando o diálogo é fechado
      reset({
        title: "",
        content: "",
        type: "informativo",
        companies: selectedCompany ? [selectedCompany.id] : [],
      });
    }
  }, [open, initialData, selectedCompany, setValue, reset]);

  const onSubmit = async (data: NoticeFormData) => {
    if (!data.companies || data.companies.length === 0) {
      toast({
        title: "Error",
        description: "Selecione pelo menos uma empresa.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      console.log("Submitting notice form:", data);
      
      let success = false;
      if (editingNoticeId) {
        console.log(`Editing notice ${editingNoticeId} for companies:`, data.companies);
        success = await updateNotice(editingNoticeId, data);
        if (success) {
          toast({
            title: "Sucesso",
            description: "Aviso atualizado com sucesso"
          });
          onOpenChange(false);
        }
      } else {
        console.log("Creating new notice for companies:", data.companies);
        success = await createNotice(data);
        if (success) {
          toast({
            title: "Sucesso",
            description: "Aviso criado com sucesso"
          });
          onOpenChange(false);
        }
      }
    } catch (error) {
      console.error("Erro ao salvar aviso:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar aviso",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle dialog close to refresh notices instantly
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Trigger instant refresh when dialog closes
      setTimeout(() => {
        if (selectedCompany?.id) {
          fetchNotices(selectedCompany.id, true);
        }
        // Dispatch custom event for other components to listen
        window.dispatchEvent(new CustomEvent('notices-updated'));
      }, 100);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{editingNoticeId ? "Editar Aviso" : "Novo Aviso"}</DialogTitle>
          <DialogDescription>
            {editingNoticeId
              ? "Edite os campos do aviso."
              : "Adicione um novo aviso para a empresa."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Título do aviso" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conteúdo</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Conteúdo do aviso" 
                        {...field} 
                        rows={6}
                        className="resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="informativo">Informativo</SelectItem>
                        <SelectItem value="urgente">Urgente</SelectItem>
                        <SelectItem value="padrão">Padrão</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <FormLabel>Empresas</FormLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {userCompanies.map((company) => (
                  <FormField
                    key={company.id}
                    control={form.control}
                    name="companies"
                    render={({ field }) => {
                      const checked = field.value?.includes(company.id);
                      return (
                        <FormItem
                          className={`
                            flex items-center gap-3 p-2 sm:p-3 rounded-lg
                            border transition-colors cursor-pointer select-none
                            ${checked ? "bg-[#ece6ff] dark:bg-indigo-950 border-primary shadow-md" : "bg-gray-50 dark:bg-gray-900 border-border"}
                            hover:border-primary/60
                          `}
                          onClick={() => {
                            if (checked) {
                              field.onChange(field.value?.filter((id) => id !== company.id));
                            } else {
                              field.onChange([...(field.value || []), company.id]);
                            }
                          }}
                          tabIndex={0}
                          role="button"
                          aria-pressed={checked}
                          onKeyDown={e => {
                            if (e.key === " " || e.key === "Enter") {
                              e.preventDefault();
                              if (checked) {
                                field.onChange(field.value?.filter((id) => id !== company.id));
                              } else {
                                field.onChange([...(field.value || []), company.id]);
                              }
                            }
                          }}
                        >
                          <div className="flex items-center space-x-2">
                            {company.logo ? (
                              <img
                                src={company.logo}
                                alt={company.nome}
                                className="h-8 w-8 rounded-full bg-gray-200 object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 font-bold border border-gray-200">
                                {company.nome?.charAt(0).toUpperCase() || "?"}
                              </div>
                            )}
                            <span className="text-sm font-medium">{company.nome}</span>
                          </div>
                          <FormControl>
                            <span className={
                              `ml-auto w-5 h-5 flex items-center justify-center rounded-full
                              border-2 ${checked ? 'border-primary bg-primary text-white' : 'border-gray-300 bg-white text-transparent'}
                              transition-colors`
                            }>
                              <svg width="16" height="16" className={checked ? "" : "invisible"} viewBox="0 0 16 16" fill="none"><path d="M4 8.5L7 11.5L12 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </span>
                          </FormControl>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewNoticeDialog;
