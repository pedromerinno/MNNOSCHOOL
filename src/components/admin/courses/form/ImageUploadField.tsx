
import React from 'react';
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import DragDropImageUpload from '@/components/ui/DragDropImageUpload';

export interface ImageUploadFieldProps {
  control: Control<any>;
  name: string;
  label: string;
  objectPrefix?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  control,
  name,
  label,
  objectPrefix = 'courses'
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
              objectPrefix={objectPrefix}
              bucketName="course-assets"
              storagePath="covers"
              label="Arraste e solte a imagem aqui ou clique para selecionar"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
