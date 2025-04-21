
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface CompanyInfo {
  id: string;
  nome: string;
  logo?: string | null;
}

interface ExistingCompanyFormProps {
  companyId: string;
  onCompanyIdChange: (id: string) => void;
  onCompanyLookup?: (company: CompanyInfo | null, lookupPending: boolean) => void;
}

const ExistingCompanyForm: React.FC<ExistingCompanyFormProps> = ({
  companyId,
  onCompanyIdChange,
  onCompanyLookup,
}) => {
  const [localId, setLocalId] = useState(companyId);
  const [lookupPending, setLookupPending] = useState(false);

  // Para evitar buscas excessivas, debounce ao sair do campo (onBlur)
  const handleBlur = async () => {
    if (onCompanyLookup) {
      setLookupPending(true);
      const res = await fetchCompany(localId);
      onCompanyLookup(res, false);
      setLookupPending(false);
    }
  };

  // Busca rápida pelo id preenchido
  const fetchCompany = async (id: string): Promise<CompanyInfo | null> => {
    if (!id || id.length < 10) return null;
    try {
      const { data } = await fetch("/api/companies/lookup?id=" + id).then(res => res.json());
      if (!data) return null;
      return data as CompanyInfo;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    setLocalId(companyId);
  }, [companyId]);

  return (
    <div className="space-y-3">
      <label htmlFor="companyId" className="text-sm text-gray-500">
        ID da empresa
      </label>
      <Input
        id="companyId"
        value={localId}
        onChange={e => {
          setLocalId(e.target.value);
          onCompanyIdChange(e.target.value);
          if (onCompanyLookup) onCompanyLookup(null, true);
        }}
        onBlur={handleBlur}
        className="border-b border-gray-300 rounded-md px-3 py-2 focus-visible:ring-merinno-dark"
        placeholder="Digite o ID da empresa"
      />
      {/* Exibição dinâmica do nome/logo vem do pai */}
    </div>
  );
};

export default ExistingCompanyForm;
