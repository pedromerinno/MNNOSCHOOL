
import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { Company } from "@/types/company";

const integrationFormSchema = z.object({
  historia: z.string().optional().nullable(),
  missao: z.string().optional().nullable(),
  valores: z.string().optional().nullable(),
  frase_institucional: z.string().optional().nullable(),
  cor_principal: z.string().min(4, "Cor inválida").default("#1EAEDB"),
});

interface CompanyIntegrationFormProps {
  company: Company;
  onSubmit: (data: z.infer<typeof integrationFormSchema>) => Promise<void>;
  isSaving: boolean;
}

export const CompanyIntegrationForm: React.FC<CompanyIntegrationFormProps> = ({
  company,
  onSubmit,
  isSaving
}) => {
  const form = useForm<z.infer<typeof integrationFormSchema>>({
    resolver: zodResolver(integrationFormSchema),
    defaultValues: {
      historia: company.historia || "",
      missao: company.missao || "",
      valores: company.valores || "",
      frase_institucional: company.frase_institucional || "",
      cor_principal: company.cor_principal || "#1EAEDB",
    },
  });

  React.useEffect(() => {
    // Atualizar formulário quando a empresa mudar
    form.reset({
      historia: company.historia || "",
      missao: company.missao || "",
      valores: company.valores || "",
      frase_institucional: company.frase_institucional || "",
      cor_principal: company.cor_principal || "#1EAEDB",
    });
  }, [company, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="frase_institucional"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frase Institucional</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite a frase institucional da empresa" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="cor_principal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor Principal</FormLabel>
                  <div className="flex space-x-2">
                    <FormControl>
                      <Input placeholder="#1EAEDB" {...field} value={field.value || "#1EAEDB"} />
                    </FormControl>
                    <div 
                      className="w-10 h-10 rounded border" 
                      style={{ backgroundColor: field.value || "#1EAEDB" }}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="historia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>História da Empresa</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="História da empresa"
                    className="min-h-[100px]"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="missao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Missão</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Missão da empresa"
                    className="min-h-[100px]"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="valores"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valores</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Valores da empresa"
                    className="min-h-[100px]"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
