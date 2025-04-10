
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";

interface TextInputFieldProps {
  control: Control<any>;
  name: string;
  label: string;
  placeholder: string;
}

export const TextInputField: React.FC<TextInputFieldProps> = ({ 
  control, 
  name, 
  label, 
  placeholder 
}) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input placeholder={placeholder} {...field} value={field.value || ""} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
