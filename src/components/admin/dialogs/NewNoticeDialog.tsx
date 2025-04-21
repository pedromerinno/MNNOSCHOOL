
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

const formSchema = z.object({
  title: z.string().min(3, { message: "O título deve ter pelo menos 3 caracteres" }),
  content: z.string().min(10, { message: "O conteúdo deve ter pelo menos 10 caracteres" }),
  type: z.string().default("geral"),
  companies: z.array(z.string()).min(1, { message: "Selecione ao menos uma empresa" })
});

interface NewNoticeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewNoticeDialog: React.FC<NewNoticeDialogProps> = ({ open, onOpenChange }) => {
  const { createNotice } = useCompanyNotices();
  const { userCompanies, isLoading: loadingCompanies } = useCompanies();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      type: "geral",
      companies: [],
    }
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      const noticeData: NoticeFormData = {
        title: values.title,
        content: values.content,
        type: values.type,
      };

      const success = await createNotice(noticeData, values.companies);

      if (success) {
        form.reset();
        onOpenChange(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Múltipla seleção customizada para Shadcn (usando checkbox-listbox sem Select do shadcn)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Aviso</DialogTitle>
          <DialogDescription>
            Crie um novo aviso para todos os membros das empresas escolhidas
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

            {/* Nova seleção múltipla de empresas */}
            <FormField
              control={form.control}
              name="companies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empresas</FormLabel>
                  <div className="flex flex-col gap-1 max-h-36 overflow-y-auto border rounded px-3 py-2 bg-muted">
                    {loadingCompanies ? (
                      <span>Carregando empresas...</span>
                    ) : userCompanies.length === 0 ? (
                      <span className="text-sm text-muted-foreground">Nenhuma empresa disponível</span>
                    ) : (
                      userCompanies.map(company => (
                        <label key={company.id} className="flex items-center gap-2 cursor-pointer select-none py-1">
                          <input
                            type="checkbox"
                            value={company.id}
                            checked={field.value?.includes(company.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                field.onChange([...field.value, company.id]);
                              } else {
                                field.onChange(field.value.filter((id: string) => id !== company.id));
                              }
                            }}
                          />
                          <span className="text-sm">{company.nome}</span>
                        </label>
                      ))
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
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Criando..." : "Criar Aviso"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewNoticeDialog;
