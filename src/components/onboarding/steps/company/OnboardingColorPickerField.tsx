
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface OnboardingColorPickerFieldProps {
  value: string;
  onChange: (color: string) => void;
}

const OnboardingColorPickerField: React.FC<OnboardingColorPickerFieldProps> = ({
  value,
  onChange
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="companyColor" className="text-sm text-gray-500 font-medium">
        Cor principal
      </Label>
      <div className="flex items-center space-x-2">
        <div 
          className="h-10 w-10 rounded-md border border-gray-200" 
          style={{ backgroundColor: value }}
        />
        <Input
          id="companyColor"
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-14 h-10 p-1"
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-32"
          placeholder="#000000"
        />
      </div>
      <p className="text-xs text-gray-500">
        Escolha a cor principal da sua marca
      </p>
    </div>
  );
};

export default OnboardingColorPickerField;
