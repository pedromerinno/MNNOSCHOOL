
import React from 'react';
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { DragDropImageUpload } from "@/components/shared/DragDropImageUpload";

export interface LogoUrlFieldProps {
  control: Control<any>;
  name: string;
  label: string;
  placeholder?: string;
  companyId?: string;
}

export const LogoUrlField: React.FC<LogoUrlFieldProps> = ({
  control,
  name,
  label,
  placeholder = "https://exemplo.com/logo.png",
  companyId
}) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <DragDropImageUpload
            value={field.value}
            onChange={field.onChange}
            companyName={companyId}
            objectPrefix="logos"
          />
        </FormItem>
      )}
    />
  );
};
