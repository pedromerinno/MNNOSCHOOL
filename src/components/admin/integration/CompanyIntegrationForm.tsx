
import React from 'react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Company } from "@/types/company";
import { TextInputField } from "./form/TextInputField";
import { TextareaField } from "./form/TextareaField";
import { ColorPickerField } from "./form/ColorPickerField";
import { LogoUrlField } from "./form/LogoUrlField";
import { ValuesField } from "./form/ValuesField";
import { SubmitButton } from "./form/SubmitButton";
import { IntegrationFormSchema } from "./form/IntegrationFormSchema";

interface CompanyIntegrationFormProps {
  company: Company;
  onSubmit: (formData: any) => Promise<void>;
  isSaving: boolean;
}

export const CompanyIntegrationForm: React.FC<CompanyIntegrationFormProps> = ({ 
  company, 
  onSubmit,
  isSaving
}) => {
  // Parse valores if it's a string
  let parsedValores = [];
  try {
    if (company.valores && typeof company.valores === 'string') {
      parsedValores = JSON.parse(company.valores);
    } else if (Array.isArray(company.valores)) {
      parsedValores = company.valores;
    }
  } catch (e) {
    console.error("Error parsing valores:", e);
    // Default to empty array if parse fails
    parsedValores = [];
  }

  // Initialize form with company data
  const form = useForm<z.infer<typeof IntegrationFormSchema>>({
    resolver: zodResolver(IntegrationFormSchema),
    defaultValues: {
      nome: company.nome || "",
      descricao: company.descricao || "",
      frase_institucional: company.frase_institucional || "",
      missao: company.missao || "",
      visao: company.visao || "",
      valores: parsedValores,
      cor_principal: company.cor_principal || "#1EAEDB",
      cor_secundaria: company.cor_secundaria || "#f5f5f5",
      logo: company.logo || "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof IntegrationFormSchema>) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <TextInputField
              form={form}
              name="nome"
              label="Nome da Empresa"
              placeholder="Digite o nome da empresa"
            />
            
            <TextareaField
              form={form}
              name="descricao"
              label="Descrição"
              placeholder="Breve descrição sobre a empresa"
            />
            
            <TextareaField
              form={form}
              name="frase_institucional"
              label="Frase Institucional"
              placeholder="Slogan ou frase de apresentação da empresa"
            />
          </div>
          
          <div className="space-y-6">
            <TextareaField
              form={form}
              name="missao"
              label="Missão"
              placeholder="Qual a missão da empresa"
            />
            
            <TextareaField
              form={form}
              name="visao"
              label="Visão"
              placeholder="Qual a visão da empresa"
            />
            
            <ValuesField
              form={form}
              name="valores"
              label="Valores"
              placeholder="Digite um valor e pressione Enter"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ColorPickerField
            form={form}
            name="cor_principal"
            label="Cor Principal"
          />
          
          <ColorPickerField
            form={form}
            name="cor_secundaria"
            label="Cor Secundária"
          />
        </div>
        
        <LogoUrlField
          form={form}
          name="logo"
          label="URL do Logo"
          placeholder="https://exemplo.com/logo.png"
        />
        
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          
          <SubmitButton isSaving={isSaving} />
        </div>
      </form>
    </Form>
  );
};
