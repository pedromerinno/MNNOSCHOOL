
import React from 'react';
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash } from "lucide-react";

interface ValuesFieldProps {
  form: ReturnType<typeof useForm<any>>;
}

export const ValuesField: React.FC<ValuesFieldProps> = ({ form }) => {
  // Certifique-se de que valores seja sempre um array
  const ensureValuesArray = () => {
    const currentValues = form.getValues('valores');
    
    // Se não tiver valores definidos, inicialize como array vazio
    if (!currentValues) {
      form.setValue('valores', []);
      return;
    }
    
    // Se for uma string (possivelmente JSON), tente converter para array
    if (typeof currentValues === 'string') {
      try {
        const parsed = JSON.parse(currentValues);
        if (Array.isArray(parsed)) {
          form.setValue('valores', parsed);
        } else {
          // Se for um objeto único, envolva em array
          form.setValue('valores', [parsed]);
        }
      } catch (e) {
        // Se não for JSON válido, inicialize como array vazio
        form.setValue('valores', []);
      }
    } 
    
    // Se não for array, inicialize como array vazio
    if (!Array.isArray(form.getValues('valores'))) {
      form.setValue('valores', []);
    }
  };
  
  // Certifique-se de que valores seja um array antes de usar o useFieldArray
  React.useEffect(() => {
    ensureValuesArray();
  }, []);
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "valores",
  });
  
  const addNewValue = () => {
    append({ title: "", description: "" });
  };
  
  return (
    <FormField
      control={form.control}
      name="valores"
      render={() => (
        <FormItem className="space-y-3">
          <FormControl>
            <div className="space-y-3">
              {Array.isArray(fields) && fields.length > 0 ? (
                fields.map((field, index) => (
                  <div 
                    key={field.id} 
                    className="grid grid-cols-1 gap-3 p-3 border rounded-lg relative"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive"
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </Button>
                    
                    <div className="space-y-1.5 pr-8">
                      <label className="text-sm font-medium">Título do Valor</label>
                      <Input 
                        {...form.register(`valores.${index}.title`)}
                        placeholder="Ex: Inovação"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Descrição</label>
                      <Textarea 
                        {...form.register(`valores.${index}.description`)}
                        placeholder="Descreva este valor da empresa"
                        rows={2}
                        className="resize-none"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-3 border rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">Nenhum valor definido. Adicione o primeiro valor da empresa.</p>
                </div>
              )}
              
              <Button
                type="button"
                variant="outline"
                onClick={addNewValue}
                className="flex items-center gap-2 w-full"
              >
                <Plus className="h-4 w-4" />
                Adicionar Valor
              </Button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
