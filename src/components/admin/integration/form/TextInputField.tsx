
import React from 'react';
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export interface TextInputFieldProps {
  control: Control<any>;
  name: string;
  label: string;
  placeholder?: string;
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
            <Input 
              {...field} 
              placeholder={placeholder}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};
