
import React from 'react';
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

interface TextareaFieldProps {
  control: Control<any>;
  name: string;
  label: string;
  placeholder?: string;
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
              {...field} 
              value={field.value || ""}
              rows={4}
              className="resize-none"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
