
import React, { useEffect } from 'react';
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
import { Loader2, Save, Palette } from "lucide-react";
import { Company } from "@/types/company";
import { toast } from "sonner";

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

  // Atualizar formulário quando a empresa mudar
  useEffect(() => {
    if (company) {
      form.reset({
        historia: company.historia || "",
        missao: company.missao || "",
        valores: company.valores || "",
        frase_institucional: company.frase_institucional || "",
        cor_principal: company.cor_principal || "#1EAEDB",
      });
    }
  }, [company, form]);

  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const value = e.target.value;
      // Validar se é uma cor HEX válida
      if (/^#([0-9A-F]{3}){1,2}$/i.test(value)) {
        form.setValue('cor_principal', value);
      }
    } catch (error) {
      console.error("Erro ao processar cor:", error);
    }
  };

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
                  <FormLabel className="flex items-center">
                    <Palette className="h-4 w-4 mr-2" />
                    Cor Principal
                  </FormLabel>
                  <div className="flex space-x-2">
                    <div className="flex-1 flex space-x-2">
                      <FormControl>
                        <Input 
                          placeholder="#1EAEDB" 
                          {...field} 
                          value={field.value || "#1EAEDB"} 
                          onChange={(e) => {
                            field.onChange(e);
                            handleColorInputChange(e);
                          }}
                        />
                      </FormControl>
                      <div className="flex items-center">
                        <input
                          type="color"
                          value={field.value || "#1EAEDB"}
                          onChange={(e) => {
                            const value = e.target.value;
                            form.setValue('cor_principal', value);
                          }}
                          className="h-9 w-12 border rounded cursor-pointer"
                        />
                      </div>
                    </div>
                    <div 
                      className="w-10 h-10 rounded border flex-shrink-0" 
                      style={{ backgroundColor: field.value || "#1EAEDB" }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Esta cor será usada para destacar elementos na interface de integração.
                  </p>
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
          <Button 
            type="submit" 
            disabled={isSaving}
            className="relative overflow-hidden transition-all duration-200"
          >
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
