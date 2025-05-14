
import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";

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
  // Create a managed input with direct reference to DOM
  const [internalValue, setInternalValue] = useState(inputValue);
  
  // Sync internal value with parent when it changes from outside
  useEffect(() => {
    console.log("ExistingCompanyIDField - inputValue changed:", inputValue);
    if (inputValue !== internalValue) {
      setInternalValue(inputValue);
    }
  }, [inputValue]);

  // Handle changes from the input element
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log("ExistingCompanyIDField - handleChange:", newValue);
    setInternalValue(newValue);
    onInputChange(newValue);
  }, [onInputChange]);

  return (
    <div className="space-y-3">
      <label htmlFor="companyId" className="text-sm text-gray-500 font-medium">
        ID da empresa
      </label>
      <div className="relative">
        <Input
          id="companyId"
          type="text"
          value={internalValue}
          onChange={handleChange}
          className="border border-gray-200 rounded-lg px-4 py-2 w-full"
          placeholder="Digite o ID da empresa"
          autoComplete="off"
        />
        {isValidated && isCompanyFound && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-500">
            <Check className="h-4 w-4" />
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Insira o ID da empresa para se vincular a uma empresa existente
      </p>
    </div>
  );
};

export default ExistingCompanyIDField;
