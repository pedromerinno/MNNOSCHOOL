
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Plus } from 'lucide-react';
import { CompanyValue } from '@/types/company';

interface NewCompanyValuesFieldProps {
  values: CompanyValue[];
  onChange: (values: CompanyValue[]) => void;
}

const NewCompanyValuesField: React.FC<NewCompanyValuesFieldProps> = ({
  values,
  onChange
}) => {
  const addValue = () => {
    const newValue: CompanyValue = { title: '', description: '' };
    onChange([...values, newValue]);
  };

  const removeValue = (index: number) => {
    const newValues = [...values];
    newValues.splice(index, 1);
    onChange(newValues);
  };

  const updateValue = (index: number, field: keyof CompanyValue, value: string) => {
    const newValues = [...values];
    newValues[index] = { ...newValues[index], [field]: value };
    onChange(newValues);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold text-gray-900">
          Valores da empresa
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addValue}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Adicionar valor</span>
        </Button>
      </div>
      
      <div className="space-y-4">
        {values.map((value, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg relative bg-gray-50/50">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeValue(index)}
              className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remover valor</span>
            </Button>
            
            <div className="space-y-3 pr-8">
              <div>
                <Label htmlFor={`value-title-${index}`} className="text-sm font-medium text-gray-700">
                  Título do valor
                </Label>
                <Input
                  id={`value-title-${index}`}
                  value={value.title}
                  onChange={(e) => updateValue(index, 'title', e.target.value)}
                  placeholder="Ex: Inovação"
                  className="mt-1 h-10"
                />
              </div>
              
              <div>
                <Label htmlFor={`value-description-${index}`} className="text-sm font-medium text-gray-700">
                  Descrição
                </Label>
                <Input
                  id={`value-description-${index}`}
                  value={value.description}
                  onChange={(e) => updateValue(index, 'description', e.target.value)}
                  placeholder="Descrição deste valor para a empresa"
                  className="mt-1 h-10"
                />
              </div>
            </div>
          </div>
        ))}
        
        {values.length === 0 && (
          <div className="text-center p-6 border border-dashed border-gray-200 rounded-lg bg-gray-50/30">
            <p className="text-sm text-gray-500">Adicione valores que representam a cultura da empresa</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewCompanyValuesField;
