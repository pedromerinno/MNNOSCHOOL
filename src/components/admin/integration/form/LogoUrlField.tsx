import React, { useState, useEffect } from 'react';
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Image, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface LogoUrlFieldProps {
  control: Control<any>;
  name: string;
  label: string;
  companyId?: string;
}

export const LogoUrlField: React.FC<LogoUrlFieldProps> = ({
  control,
  name,
  label,
  companyId
}) => {
  const [isUploading, setIsUploading] = useState(false);
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast.error("Por favor selecione uma imagem válida");
      return;
    }

    setIsUploading(true);
    
    try {
      // Create a unique file name using the company ID and timestamp
      const fileExt = file.name.split('.').pop();
      const fileName = `${companyId || 'company'}-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;
      
      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('company-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) throw error;
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('company-assets')
        .getPublicUrl(filePath);
      
      // Update the form field with the new URL
      onChange(publicUrl);
      toast.success("Logo carregado com sucesso");
    } catch (error: any) {
      console.error("Error uploading logo:", error);
      
      if (error.message?.includes("storage/bucket-not-found")) {
        toast.error("Sistema de armazenamento não configurado. Contate o administrador.");
      } else {
        toast.error(`Erro ao carregar logo: ${error.message}`);
      }
    } finally {
      setIsUploading(false);
      // Clear the input value so the same file can be selected again
      e.target.value = '';
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <div className="space-y-3">
            <div className="flex gap-2">
              <FormControl>
                <div className="flex-1 relative">
                  <Input 
                    type="text" 
                    {...field} 
                    placeholder="https://example.com/logo.png"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center">
                    <Image className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </FormControl>
              <div className="relative">
                <Button 
                  type="button" 
                  variant="outline"
                  disabled={isUploading}
                  className="relative"
                  onClick={() => document.getElementById(`logo-upload-${name}`)?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? 'Carregando...' : 'Upload'}
                </Button>
                <input 
                  id={`logo-upload-${name}`}
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, field.onChange)}
                  className="hidden"
                />
              </div>
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
