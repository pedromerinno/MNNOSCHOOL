
import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";

interface CompanyInfo {
  id: string;
  nome: string;
  logo?: string | null;
}

interface ExistingCompanyFormProps {
  companyId: string;
  onCompanyIdChange: (id: string) => void;
  onCompanyLookup?: (company: CompanyInfo | null, lookupPending: boolean) => Promise<void>;
}

const ExistingCompanyForm: React.FC<ExistingCompanyFormProps> = ({
  companyId,
  onCompanyIdChange,
  onCompanyLookup,
}) => {
  // Simplificação do processo de debounce para reduzir complexidade
  const handleInputChange = (value: string) => {
    onCompanyIdChange(value);
    
    if (onCompanyLookup && value.length >= 10) {
      // Notifica que uma busca está pendente
      onCompanyLookup(null, true);
      
      // Inicia a busca após um curto período
      setTimeout(() => {
        handleBlur();
      }, 500);
    }
  };

  const handleBlur = async () => {
    if (!onCompanyLookup) return;
    
    if (companyId.length >= 10) {
      await onCompanyLookup(null, false);
    } else {
      onCompanyLookup(null, false);
    }
  };

  // Buscar companhia ao montar o componente se o ID já existir
  useEffect(() => {
    if (companyId && companyId.length >= 10 && onCompanyLookup) {
      handleBlur();
    }
  }, []);

  return (
    <div className="space-y-3">
      <label htmlFor="companyId" className="text-sm text-gray-500">
        ID da empresa
      </label>
      <Input
        id="companyId"
        value={companyId}
        onChange={e => handleInputChange(e.target.value)}
        onBlur={handleBlur}
        className="border-b border-gray-300 rounded-md px-3 py-2 focus-visible:ring-black"
        placeholder="Digite o ID da empresa"
      />
    </div>
  );
};

export default ExistingCompanyForm;
