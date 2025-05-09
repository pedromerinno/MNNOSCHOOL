
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface CompanyInfo {
  id: string;
  nome: string;
  logo?: string | null;
}

interface ExistingCompanyFormProps {
  companyId?: string;
  onCompanyIdChange?: (id: string) => void;
  onCompanyLookup?: (company: CompanyInfo | null, lookupPending: boolean) => void;
  onBack?: () => void;
  onComplete?: () => void;
}

const ExistingCompanyForm: React.FC<ExistingCompanyFormProps> = ({
  companyId = "",
  onCompanyIdChange = () => {},
  onCompanyLookup,
  onBack,
  onComplete,
}) => {
  const [localId, setLocalId] = useState(companyId);
  const [lookupPending, setLookupPending] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [company, setCompany] = useState<CompanyInfo | null>(null);

  // Para debounce enquanto o usuário digita
  const handleInputChange = (value: string) => {
    setLocalId(value);
    onCompanyIdChange(value);
    
    if (onCompanyLookup) {
      onCompanyLookup(null, true);
      
      // Limpa timer anterior se houver
      if (debounceTimer) clearTimeout(debounceTimer);
      
      // Configura novo timer para buscar após um curto período de tempo
      if (value.length >= 10) {
        const timer = setTimeout(() => {
          handleBlur();
        }, 500);
        setDebounceTimer(timer);
      }
    }
  };

  // Para evitar buscas excessivas, debounce ao sair do campo (onBlur)
  const handleBlur = async () => {
    if (onCompanyLookup) {
      setLookupPending(true);
      const res = await fetchCompany(localId);
      onCompanyLookup(res, false);
      setCompany(res);
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
    
    // Se já temos um ID válido ao montar o componente, buscar imediatamente
    if (companyId && companyId.length >= 10 && onCompanyLookup) {
      handleBlur();
    }
    
    return () => {
      // Limpa qualquer timer pendente ao desmontar
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [companyId]);

  return (
    <div className="space-y-5">
      {/* Back button */}
      {onBack && (
        <Button 
          type="button" 
          variant="ghost"
          className="mb-4 flex items-center justify-center gap-2 text-gray-500"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      )}

      <div className="space-y-3">
        <label htmlFor="companyId" className="text-sm text-gray-500">
          ID da empresa
        </label>
        <Input
          id="companyId"
          value={localId}
          onChange={e => handleInputChange(e.target.value)}
          onBlur={handleBlur}
          className="border-b border-gray-300 rounded-md px-3 py-2 focus-visible:ring-merinno-dark"
          placeholder="Digite o ID da empresa"
        />
      </div>

      {/* Company lookup result */}
      {lookupPending && (
        <div className="mt-4 space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      )}

      {!lookupPending && company && (
        <div className="mt-4 p-4 border border-green-200 rounded-md bg-green-50">
          <h4 className="font-medium text-green-800">Empresa encontrada!</h4>
          <p className="text-sm text-green-700">{company.nome}</p>
        </div>
      )}

      {!lookupPending && localId && localId.length >= 10 && !company && (
        <div className="mt-4 p-4 border border-red-200 rounded-md bg-red-50">
          <p className="text-sm text-red-700">Nenhuma empresa encontrada com este ID.</p>
        </div>
      )}

      {/* Complete button */}
      {onComplete && (
        <Button 
          type="button" 
          className="w-full mt-8"
          onClick={onComplete}
          disabled={!company && localId.length >= 1}
        >
          Concluir
        </Button>
      )}
    </div>
  );
};

export default ExistingCompanyForm;
