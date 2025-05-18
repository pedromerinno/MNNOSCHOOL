
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingLogoUploadFieldProps {
  value: string | null;
  onChange: (url: string | null) => void;
}

const OnboardingLogoUploadField: React.FC<OnboardingLogoUploadFieldProps> = ({ 
  value, 
  onChange 
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('O arquivo deve ter no máximo 2MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione um arquivo de imagem válido');
      return;
    }

    // Upload file
    setIsUploading(true);
    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `company-logos/${fileName}`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      onChange(urlData.publicUrl);
      toast.success('Logo enviado com sucesso!');
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(error.message || 'Erro ao enviar o arquivo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="logo" className="text-sm text-gray-500 font-medium">
        Logo da empresa
      </Label>
      
      {!value ? (
        <div className="mt-1 flex items-center">
          <label htmlFor="logo-upload" className="cursor-pointer">
            <div className="flex items-center space-x-2 py-2 px-4 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors">
              <Upload className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                {isUploading ? 'Enviando...' : 'Escolher arquivo'}
              </span>
            </div>
            <input
              id="logo-upload"
              name="logo"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
          <p className="ml-4 text-xs text-gray-500">
            PNG, JPG ou GIF (máx. 2MB)
          </p>
        </div>
      ) : (
        <div className="mt-1 flex items-start">
          <img
            src={value}
            alt="Logo da empresa"
            className="h-16 w-16 object-contain border border-gray-200 rounded-md bg-white p-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemoveFile}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
            <span className="ml-1">Remover</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default OnboardingLogoUploadField;
