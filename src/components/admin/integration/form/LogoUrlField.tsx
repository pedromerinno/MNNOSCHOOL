
import React from 'react';
import { Control } from "react-hook-form";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import EnhancedImageUpload from '@/components/ui/EnhancedImageUpload';

export interface LogoUrlFieldProps {
  control: Control<any>;
  name: string;
  label?: string;
  placeholder?: string;
  companyId?: string;
}

export const LogoUrlField: React.FC<LogoUrlFieldProps> = ({
  control,
  name,
  label = "Logo da Empresa",
  placeholder = "https://example.com/logo.png",
  companyId
}) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <EnhancedImageUpload
              value={field.value}
              onChange={field.onChange}
              objectPrefix={companyId || 'company'}
              bucketName="company-assets"
              storagePath="logos"
              label={label}
              description="Faça upload do logo da sua empresa. Formatos aceitos: JPG, PNG, SVG (máx. 2MB)"
              aspectRatio="square"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
