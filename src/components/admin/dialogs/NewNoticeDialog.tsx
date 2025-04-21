import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useCompanyNotices, NoticeFormData } from "@/hooks/useCompanyNotices";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCompanies } from "@/hooks/useCompanies";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  title: z.string().min(3, { message: "O título deve ter pelo menos 3 caracteres" }),
  content: z.string().min(10, { message: "O conteúdo deve ter pelo menos 10 caracteres" }),
  type: z.string().default("geral"),
  companies: z.array(z.string()).min(1, { message: "Selecione ao menos uma empresa" })
});

interface NewNoticeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<NoticeFormData> & { companies?: string[] };
  editingNoticeId?: string | null;
}

const NewNoticeDialog: React.FC<NewNoticeDialogProps> = ({
  open,
  onOpenChange,
  initialData,
  editingNoticeId
}) => {
  const { createNotice, updateNotice, isLoading } = useCompanyNotices();
  const { userCompanies, isLoading: loadingCompanies } = useCompanies();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      type: initialData?.type || "geral",
      companies: initialData?.companies || [],
    }
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: initialData?.title || "",
        content: initialData?.content || "",
        type: initialData?.type || "geral",
        companies: initialData?.companies || [],
      });
    }
  }, [open, initialData, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      const noticeData: NoticeFormData = {
        title: values.title,
        content: values.content,
        type: values.type,
      };

      let success: boolean = false;
      if (editingNoticeId) {
        success = await updateNotice(editingNoticeId, noticeData);
      } else {
        success = await createNotice(noticeData, values.companies);
      }

      if (success) {
        form.reset();
        onOpenChange(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingNoticeId ? "Editar Aviso" : "Criar Novo Aviso"}
          </DialogTitle>
          <DialogDescription>
            {editingNoticeId
              ? "Altere o aviso para as empresas marcadas."
              : "Crie um novo aviso para todos os membros das empresas escolhidas"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <SelectItem value="geral">Geral</SelectItem>
                      <SelectItem value="recesso">Recesso</SelectItem>
                      <SelectItem value="feriado">Feriado</SelectItem>
                      <SelectItem value="evento">Evento</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conteúdo</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Conteúdo do aviso"
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="companies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empresas</FormLabel>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                    {loadingCompanies ? (
                      <span>Carregando empresas...</span>
                    ) : userCompanies.length === 0 ? (
                      <span className="text-sm text-muted-foreground">Nenhuma empresa disponível</span>
                    ) : (
                      userCompanies.map(company => {
                        const checked = field.value?.includes(company.id);
                        return (
                          <label
                            key={company.id}
                            className={`
                              flex items-center gap-2 cursor-pointer rounded-lg border px-3 py-2 min-w-[110px] transition
                              text-gray-800 dark:text-gray-100 select-none
                              ${checked
                                ? "border-[#9b87f5] bg-[#E5DEFF]/60"
                                : "border-gray-200 dark:border-gray-800 hover:border-[#9b87f5] bg-white dark:bg-[#1A1F2C]"
                              }
                              shadow-sm
                            `}
                            style={{ fontSize: '0.98rem' }}
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={() => {
                                if (checked) {
                                  field.onChange(field.value.filter((id: string) => id !== company.id));
                                } else {
                                  field.onChange([...field.value, company.id]);
                                }
                              }}
                              className="mr-2"
                            />
                            {company.logo && (
                              <img
                                src={company.logo}
                                alt={company.nome}
                                className="h-5 w-5 rounded-full object-cover border border-gray-200 dark:border-gray-700 ml-1"
                              />
                            )}
                            <span className="text-xs font-semibold ml-1">{company.nome}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (editingNoticeId ? "Salvando..." : "Criando...") : (editingNoticeId ? "Salvar" : "Criar Aviso")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewNoticeDialog;
