
import React from 'react';
import { Label } from '@/components/ui/label';
import DragDropImageUpload from '@/components/ui/DragDropImageUpload';

interface OnboardingLogoUploadFieldProps {
  value: string | null;
  onChange: (url: string | null) => void;
}

const OnboardingLogoUploadField: React.FC<OnboardingLogoUploadFieldProps> = ({ 
  value, 
  onChange 
}) => {
  const handleChange = (url: string) => {
    onChange(url);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="logo" className="text-sm text-gray-500 font-medium">
        Logo da empresa
      </Label>
      
      <DragDropImageUpload
        value={value}
        onChange={handleChange}
        objectPrefix="company"
        bucketName="company-assets"
        storagePath="logos"
        label="Arraste e solte o logo da empresa aqui ou clique para selecionar"
        className="mt-1"
      />
      <p className="text-xs text-gray-500 mt-1">
        PNG, JPG ou GIF (máx. 2MB)
      </p>
    </div>
  );
};

export default OnboardingLogoUploadField;
