
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Plus, Trash2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { IntegrationFormValues } from './IntegrationFormSchema';

interface ValuesFieldProps {
  form: UseFormReturn<IntegrationFormValues>;
}

export const ValuesField: React.FC<ValuesFieldProps> = ({ form }) => {
  const values = form.watch('valores') || [];

  const addValue = () => {
    const currentValues = form.getValues('valores') || [];
    form.setValue('valores', [...currentValues, { title: '', description: '' }]);
  };

  const removeValue = (index: number) => {
    const currentValues = form.getValues('valores') || [];
    form.setValue('valores', currentValues.filter((_, i) => i !== index));
  };

  return (
    <FormField
      control={form.control}
      name="valores"
      render={() => (
        <FormItem>
          <FormLabel>Valores da Empresa</FormLabel>
          <div className="space-y-4">
            {values.map((_, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="flex-1 space-y-4">
                  <FormField
                    control={form.control}
                    name={`valores.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Título do valor" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`valores.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Descrição do valor" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeValue(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addValue}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Valor
            </Button>
          </div>
        </FormItem>
      )}
    />
  );
};
