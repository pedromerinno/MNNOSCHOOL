
import React from 'react';
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export interface ColorPickerFieldProps {
  control: Control<any>;
  name: string;
  label: string;
}

export const ColorPickerField: React.FC<ColorPickerFieldProps> = ({
  control,
  name,
  label
}) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded border" 
              style={{ backgroundColor: field.value || "#1EAEDB" }}
            />
            <FormControl>
              <Input 
                type="text" 
                {...field} 
                placeholder="#RRGGBB"
              />
            </FormControl>
          </div>
        </FormItem>
      )}
    />
  );
};
