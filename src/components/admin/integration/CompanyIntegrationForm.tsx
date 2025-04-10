
import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Company } from "@/types/company";
import { TextareaField } from "./form/TextareaField";
import { TextInputField } from "./form/TextInputField";
import { LogoUrlField } from "./form/LogoUrlField";
import { ColorPickerField } from "./form/ColorPickerField";
import { SubmitButton } from "./form/SubmitButton";
import { integrationFormSchema, IntegrationFormValues } from "./form/IntegrationFormSchema";

interface CompanyIntegrationFormProps {
  company: Company;
  onSubmit: (data: IntegrationFormValues) => void;
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
      nome: company.nome || "",
      logo: company.logo || "",
      historia: company.historia || "",
      missao: company.missao || "",
      valores: company.valores || "",
      frase_institucional: company.frase_institucional || "",
      cor_principal: company.cor_principal || "#1EAEDB"
    }
  });

  // Handle form submission
  const handleSubmit = (data: IntegrationFormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <TextInputField
          control={form.control}
          name="nome"
          label="Nome da Empresa"
          placeholder="Nome oficial da empresa..."
        />
        
        <LogoUrlField
          control={form.control}
          name="logo"
          label="Logo da Empresa"
          companyId={company.id}
        />
        
        <TextareaField
          control={form.control}
          name="frase_institucional"
          label="Frase Institucional"
          placeholder="Uma frase que representa a essência da empresa..."
        />
        
        <TextareaField
          control={form.control}
          name="historia"
          label="História da Empresa"
          placeholder="Descreva a história e trajetória da empresa..."
        />
        
        <TextareaField
          control={form.control}
          name="missao"
          label="Missão"
          placeholder="Descreva a missão da empresa..."
        />
        
        <TextareaField
          control={form.control}
          name="valores"
          label="Valores"
          placeholder="Liste os valores da empresa..."
        />
        
        <ColorPickerField 
          control={form.control}
          name="cor_principal"
          label="Cor Principal"
        />
        
        <div className="flex justify-end">
          <SubmitButton isSaving={isSaving} />
        </div>
      </form>
    </Form>
  );
};
