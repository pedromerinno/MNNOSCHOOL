
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, AlertCircle } from 'lucide-react';

interface ExistingCompanyIDFieldProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  isValidated: boolean;
  isCompanyFound: boolean;
}

const ExistingCompanyIDField: React.FC<ExistingCompanyIDFieldProps> = ({
  inputValue,
  onInputChange,
  isValidated,
  isCompanyFound
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="companyId" className="block text-sm font-medium text-gray-700">
        ID ou Nome da Empresa
      </Label>
      <div className="relative">
        <Input
          id="companyId"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Digite o ID ou nome da empresa"
          className={`pr-10 ${
            isValidated && (isCompanyFound ? 'border-green-500 focus:border-green-500 focus:ring-green-500' 
                                        : 'border-red-500 focus:border-red-500 focus:ring-red-500')
          }`}
        />
        {isValidated && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {isCompanyFound ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
          </div>
        )}
      </div>
      <p className="text-sm text-gray-500">
        Digite o ID (UUID) ou o nome da empresa para vincular-se a ela
      </p>
    </div>
  );
};

export default ExistingCompanyIDField;
