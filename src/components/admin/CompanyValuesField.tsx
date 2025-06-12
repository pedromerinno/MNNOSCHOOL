
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash } from 'lucide-react';
import { CompanyValue } from '@/types/company';

interface CompanyValuesFieldProps {
  values: CompanyValue[];
  onChange: (values: CompanyValue[]) => void;
}

export const CompanyValuesField: React.FC<CompanyValuesFieldProps> = ({
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
        <Label className="text-sm font-medium">
          Valores da empresa
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addValue}
          className="flex items-center space-x-1"
        >
          <Plus className="h-4 w-4" />
          <span>Adicionar valor</span>
        </Button>
      </div>
      
      <div className="space-y-4">
        {values.map((value, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg relative">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeValue(index)}
              className="absolute top-2 right-2 h-6 w-6 p-0"
            >
              <Trash className="h-4 w-4" />
              <span className="sr-only">Remover valor</span>
            </Button>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor={`value-title-${index}`} className="text-sm">
                  Título do valor
                </Label>
                <Input
                  id={`value-title-${index}`}
                  value={value.title}
                  onChange={(e) => updateValue(index, 'title', e.target.value)}
                  placeholder="Ex: Inovação"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor={`value-description-${index}`} className="text-sm">
                  Descrição
                </Label>
                <Textarea
                  id={`value-description-${index}`}
                  value={value.description}
                  onChange={(e) => updateValue(index, 'description', e.target.value)}
                  placeholder="Descrição deste valor para a empresa"
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          </div>
        ))}
        
        {values.length === 0 && (
          <div className="text-center p-4 border border-dashed border-gray-200 rounded-lg">
            <p className="text-sm text-gray-500">Adicione valores que representam a cultura da empresa</p>
          </div>
        )}
      </div>
    </div>
  );
};
