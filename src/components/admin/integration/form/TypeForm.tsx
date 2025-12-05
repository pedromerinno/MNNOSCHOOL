import React from 'react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Company } from "@/types/company";
import { ColorPickerField } from "./ColorPickerField";
import { LogoUrlField } from "./LogoUrlField";
import { SubmitButton } from "./SubmitButton";
import { integrationFormSchema } from "./IntegrationFormSchema";

interface TypeFormProps {
  company: Company;
  onSubmit: (formData: any) => Promise<void>;
  isSaving: boolean;
}

export const TypeForm: React.FC<TypeFormProps> = ({
  company,
  onSubmit,
  isSaving
}) => {
  // Initialize form with company data
  const form = useForm<z.infer<typeof integrationFormSchema>>({
    resolver: zodResolver(integrationFormSchema),
    defaultValues: {
      nome: company.nome || "",
      frase_institucional: company.frase_institucional || "",
      missao: company.missao || "",
      historia: company.historia || "",
      valores: [],
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
          <h3 className="text-base font-semibold text-foreground mb-1">Tipo da Empresa</h3>
          <p className="text-sm text-muted-foreground">Configure a identidade visual básica da empresa</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LogoUrlField 
            control={form.control} 
            name="logo" 
            companyId={company.id} 
          />
          
          <ColorPickerField 
            control={form.control} 
            name="cor_principal" 
            label="Cor Principal" 
          />
        </div>

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




