
import React, { useRef, useState, useEffect } from "react";
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
  // Create an uncontrolled input with ref
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Local state to track the input value
  const [localValue, setLocalValue] = useState(inputValue);
  
  useEffect(() => {
    if (inputRef.current && inputValue !== inputRef.current.value) {
      console.log("Setting input ref value to:", inputValue);
      inputRef.current.value = inputValue;
    }
  }, [inputValue]);

  // Handle changes directly from the DOM element
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log("ExistingCompanyIDField - Input changed:", newValue);
    setLocalValue(newValue);
    onInputChange(newValue);
  };

  return (
    <div className="space-y-3">
      <label htmlFor="companyId" className="text-sm text-gray-500 font-medium">
        ID da empresa
      </label>
      <div className="relative">
        <Input
          id="companyId"
          ref={inputRef}
          type="text"
          defaultValue={inputValue}
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
