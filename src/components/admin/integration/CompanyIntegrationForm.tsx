
import React, { useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Company } from "@/types/company";
import { TextInputField } from "./form/TextInputField";
import { TextareaField } from "./form/TextareaField";
import { ColorPickerField } from "./form/ColorPickerField";
import { SubmitButton } from "./form/SubmitButton";
import { integrationFormSchema, IntegrationFormValues } from "./form/IntegrationFormSchema";

interface CompanyIntegrationFormProps {
  company: Company;
  onSubmit: (data: IntegrationFormValues) => Promise<void>;
  isSaving: boolean;
}

export const CompanyIntegrationForm: React.FC<CompanyIntegrationFormProps> = ({
  company,
  onSubmit,
  isSaving
}) => {
  const form = useForm<IntegrationFormValues>({
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextInputField
              control={form.control}
              name="frase_institucional"
              label="Frase Institucional"
              placeholder="Digite a frase institucional da empresa"
            />
            
            <ColorPickerField
              control={form.control}
              defaultValue="#1EAEDB"
            />
          </div>
          
          <TextareaField
            control={form.control}
            name="historia"
            label="História da Empresa"
            placeholder="História da empresa"
          />
          
          <TextareaField
            control={form.control}
            name="missao"
            label="Missão"
            placeholder="Missão da empresa"
          />
          
          <TextareaField
            control={form.control}
            name="valores"
            label="Valores"
            placeholder="Valores da empresa"
          />
        </div>
        
        <div className="flex justify-end">
          <SubmitButton isSaving={isSaving} />
        </div>
      </form>
    </Form>
  );
};
