
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Palette } from "lucide-react";
import { Control } from "react-hook-form";

interface ColorPickerFieldProps {
  control: Control<any>;
  defaultValue?: string;
}

export const ColorPickerField: React.FC<ColorPickerFieldProps> = ({ 
  control, 
  defaultValue = "#1EAEDB" 
}) => {
  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
    try {
      const value = e.target.value;
      // Validar se é uma cor HEX válida
      if (/^#([0-9A-F]{3}){1,2}$/i.test(value)) {
        onChange(value);
      }
    } catch (error) {
      console.error("Erro ao processar cor:", error);
    }
  };

  return (
    <FormField
      control={control}
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
                  value={field.value || defaultValue} 
                  onChange={(e) => {
                    field.onChange(e);
                    handleColorInputChange(e, field.onChange);
                  }}
                />
              </FormControl>
              <div className="flex items-center">
                <input
                  type="color"
                  value={field.value || defaultValue}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value);
                  }}
                  className="h-9 w-12 border rounded cursor-pointer"
                  aria-label="Selecionar cor"
                />
              </div>
            </div>
            <div 
              className="w-10 h-10 rounded border flex-shrink-0" 
              style={{ backgroundColor: field.value || defaultValue }}
              aria-hidden="true"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Esta cor será usada para destacar elementos na interface de integração.
          </p>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
