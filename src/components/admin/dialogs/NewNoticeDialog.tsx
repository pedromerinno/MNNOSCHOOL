
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
import { Label } from "@/components/ui/label";
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
import { Checkbox } from "@/components/ui/checkbox";

// Adicionar props para callback após operação bem-sucedida
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
  const { createNotice, updateNotice } = useCompanyNotices();
  const { userCompanies } = useCompanies();
  const [dialogOpen, setDialogOpen] = useState(open);
  const [submitting, setSubmitting] = useState(false);

  const formSchema = z.object({
    title: z.string().min(2, {
      message: "Título deve ter pelo menos 2 caracteres.",
    }),
    content: z.string().min(10, {
      message: "Conteúdo deve ter pelo menos 10 caracteres.",
    }),
    type: z.enum(['informativo', 'urgente', 'padrão']),
    companies: z.array(z.string()).optional(),
  });

  const form = useForm<NoticeFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      type: initialData?.type || "informativo",
      companies: initialData?.companies || [],
    },
    mode: "onChange",
  });

  const { reset, watch, setValue } = form;

  useEffect(() => {
    setDialogOpen(open);
    if (open && initialData) {
      Object.keys(initialData).forEach(key => {
        setValue(key as keyof NoticeFormData, initialData[key]);
      });
    }
  }, [open, initialData, setValue]);

  const selectedCompanies = watch("companies");

  useEffect(() => {
    if (!dialogOpen) {
      // Reset form when dialog is closed
      reset({
        title: initialData?.title || "",
        content: initialData?.content || "",
        type: initialData?.type || "informativo",
        companies: initialData?.companies || [],
      });
    }
  }, [dialogOpen, reset, initialData]);

  // Atualizar o onSubmit para notificar a conclusão bem-sucedida
  const onSubmit = async (data: NoticeFormData) => {
    setSubmitting(true);
    
    try {
      if (editingNoticeId) {
        console.log("Editando aviso:", editingNoticeId, "Empresas:", data.companies);
        const success = await updateNotice(editingNoticeId, data);
        if (success) {
          setDialogOpen(false);
          onOpenChange(false);
          reset();
        }
      } else {
        console.log("Enviando formulário com valores:", data);
        const success = await createNotice(data, data.companies);
        if (success) {
          setDialogOpen(false);
          onOpenChange(false);
          reset();
        }
      }
    } catch (error) {
      console.error("Erro ao salvar aviso:", error);
      // Changed from toast.error to toast with variant destructive
      toast({
        title: "Erro",
        description: "Erro ao salvar aviso",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={onOpenChange}>
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
                      <Input placeholder="Conteúdo do aviso" {...field} />
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
              <div className="grid gap-2">
                {userCompanies.map((company) => (
                  <FormField
                    key={company.id}
                    control={form.control}
                    name="companies"
                    render={({ field }) => {
                      return (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel htmlFor={company.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              {company.nome}
                            </FormLabel>
                            <p className="text-sm text-muted-foreground">
                              {company.nome} {/* Changed from company.email to company.nome since email doesn't exist */}
                            </p>
                          </div>
                          <FormControl>
                            <Checkbox
                              id={company.id}
                              checked={field.value?.includes(company.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...(field.value || []), company.id])
                                } else {
                                  field.onChange(field.value?.filter((value) => value !== company.id))
                                }
                              }}
                            />
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
