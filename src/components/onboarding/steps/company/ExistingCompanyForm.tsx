
import React from "react";
import { Input } from "@/components/ui/input";

interface ExistingCompanyFormProps {
  companyId: string;
  onCompanyIdChange: (id: string) => void;
}

const ExistingCompanyForm: React.FC<ExistingCompanyFormProps> = ({
  companyId,
  onCompanyIdChange,
}) => {
  return (
    <div className="space-y-3">
      <label htmlFor="companyId" className="text-sm text-gray-500">
        ID da empresa
      </label>
      <Input
        id="companyId"
        value={companyId}
        onChange={(e) => onCompanyIdChange(e.target.value)}
        className="border-b border-gray-300 rounded-md px-3 py-2 focus-visible:ring-merinno-dark"
        placeholder="Digite o ID da empresa"
      />
    </div>
  );
};

export default ExistingCompanyForm;
