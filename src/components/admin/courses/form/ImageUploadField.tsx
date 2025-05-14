
import React from 'react';
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DragDropImageUpload } from '@/components/shared/DragDropImageUpload';

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
          <DragDropImageUpload
            value={field.value}
            onChange={field.onChange}
            objectPrefix={`covers/${objectPrefix}`}
            storageBucket="course-assets"
          />
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
