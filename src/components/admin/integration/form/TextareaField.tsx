
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";

interface TextareaFieldProps {
  control: Control<any>;
  name: string;
  label: string;
  placeholder: string;
}

export const TextareaField: React.FC<TextareaFieldProps> = ({ 
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
            <Textarea 
              placeholder={placeholder}
              className="min-h-[100px]"
              {...field}
              value={field.value || ""}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
