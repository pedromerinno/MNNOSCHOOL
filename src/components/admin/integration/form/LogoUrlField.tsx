
import React from 'react';
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import DragDropImageUpload from '@/components/ui/DragDropImageUpload';

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
  placeholder = "https://example.com/logo.png",
  companyId
}) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <DragDropImageUpload
              value={field.value}
              onChange={field.onChange}
              objectPrefix={companyId || 'company'}
              bucketName="company-assets"
              storagePath="logos"
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};
