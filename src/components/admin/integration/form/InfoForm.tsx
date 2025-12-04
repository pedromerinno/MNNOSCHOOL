
import React from 'react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Company } from "@/types/company";
import { TextInputField } from "./TextInputField";
import { TextareaField } from "./TextareaField";
import { ValuesField } from "./ValuesField";
import { SubmitButton } from "./SubmitButton";
import { integrationFormSchema } from "./IntegrationFormSchema";

interface InfoFormProps {
  company: Company;
  onSubmit: (formData: any) => Promise<void>;
  isSaving: boolean;
}

export const InfoForm: React.FC<InfoFormProps> = ({
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
    parsedValores = [];
  }

  // Initialize form with company data
  const form = useForm<z.infer<typeof integrationFormSchema>>({
    resolver: zodResolver(integrationFormSchema),
    defaultValues: {
      nome: company.nome || "",
      frase_institucional: company.frase_institucional || "",
      missao: company.missao || "",
      historia: company.historia || "",
      valores: parsedValores,
      cor_principal: company.cor_principal || "#1EAEDB",
      logo: company.logo || ""
    }
  });

  const handleSubmit = async (data: z.infer<typeof integrationFormSchema>) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div>
          <h3 className="text-base font-semibold text-foreground mb-1">Informações básicas</h3>
          <p className="text-sm text-muted-foreground">Dados fundamentais da empresa</p>
        </div>
        
        <TextInputField 
          control={form.control} 
          name="nome" 
          label="Nome da Empresa" 
          placeholder="Digite o nome da empresa" 
        />
        
        <TextareaField 
          control={form.control} 
          name="frase_institucional" 
          label="Frase Institucional" 
          placeholder="Slogan ou frase de apresentação da empresa" 
        />

        <div className="pt-4">
          <h3 className="text-base font-semibold text-foreground mb-1">Sobre a empresa</h3>
          <p className="text-sm text-muted-foreground mb-4">Missão, valores e cultura organizacional</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextareaField 
            control={form.control} 
            name="missao" 
            label="Missão" 
            placeholder="Qual a missão da empresa" 
          />
          
          <TextareaField 
            control={form.control} 
            name="historia" 
            label="Declaração de Cultura" 
            placeholder="Conte a declaração de cultura da empresa" 
          />
        </div>

        <div className="pt-4">
          <h3 className="text-base font-semibold text-foreground mb-1">Valores da empresa</h3>
          <p className="text-sm text-muted-foreground mb-4">Os valores que guiam sua organização</p>
        </div>
        
        <ValuesField form={form} />

        {/* Botões de Ação */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => form.reset()} 
            disabled={isSaving}
            className="min-w-[120px]"
          >
            Cancelar
          </Button>
          
          <SubmitButton isSaving={isSaving} />
        </div>
      </form>
    </Form>
  );
};





