
import React from 'react';
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Image } from "lucide-react";

export interface LogoUrlFieldProps {
  control: Control<any>;
  name: string;
  label: string;
}

export const LogoUrlField: React.FC<LogoUrlFieldProps> = ({
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
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FormControl>
                <div className="flex-1 relative">
                  <Input 
                    type="text" 
                    {...field} 
                    placeholder="https://example.com/logo.png"
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center">
                    <Image className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </FormControl>
            </div>
            {field.value && (
              <div className="border rounded-md p-2 flex justify-center">
                <img 
                  src={field.value} 
                  alt="Logo da empresa" 
                  className="max-h-20 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                    target.onerror = null;
                  }}
                />
              </div>
            )}
          </div>
        </FormItem>
      )}
    />
  );
};
