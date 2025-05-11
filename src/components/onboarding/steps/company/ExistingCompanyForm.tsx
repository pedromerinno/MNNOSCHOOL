
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2 } from "lucide-react";
import { useQuickCompanyLookup } from "@/hooks/company/useQuickCompanyLookup";
import { toast } from "sonner";

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
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Use the hook for company lookup
  const { companyInfo, loading, error, fetchCompany } = useQuickCompanyLookup();
  
  // Handle input change with debounce
  const handleInputChange = (value: string) => {
    setLocalId(value);
    onCompanyIdChange(value);
    
    // Clear previous timer
    if (debounceTimer) clearTimeout(debounceTimer);
    
    // Set up new timer for lookup
    if (value.length >= 10) {
      const timer = setTimeout(() => {
        fetchCompany(value);
      }, 500);
      setDebounceTimer(timer);
    }
  };

  // When component unmounts, clear any pending timers
  useEffect(() => {
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [debounceTimer]);

  // Initial lookup if companyId is provided
  useEffect(() => {
    setLocalId(companyId);
    
    if (companyId && companyId.length >= 10) {
      fetchCompany(companyId);
    }
  }, [companyId, fetchCompany]);

  // Notify parent component about lookup results
  useEffect(() => {
    if (onCompanyLookup) {
      onCompanyLookup(companyInfo, loading);
    }
  }, [companyInfo, loading, onCompanyLookup]);

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
        <div className="relative">
          <Input
            id="companyId"
            value={localId}
            onChange={e => handleInputChange(e.target.value)}
            className="border border-gray-200 rounded-md px-3 py-2 focus-visible:ring-gray-400"
            placeholder="Digite o ID da empresa"
          />
        </div>
      </div>

      {/* Company lookup result */}
      {loading && (
        <div className="mt-4">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      )}

      {!loading && companyInfo && (
        <div className="mt-4 p-4 border border-emerald-100 rounded-md bg-emerald-50 flex items-center gap-3 transition-all duration-300 animate-in fade-in">
          {companyInfo.logo ? (
            <img 
              src={companyInfo.logo} 
              alt={companyInfo.nome}
              className="h-8 w-8 object-contain rounded"
            />
          ) : (
            <div className="h-8 w-8 rounded-md bg-emerald-100 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-emerald-600" />
            </div>
          )}
          <div>
            <h4 className="font-medium text-emerald-800">Empresa encontrada</h4>
            <p className="text-sm text-emerald-600">{companyInfo.nome}</p>
          </div>
        </div>
      )}

      {!loading && localId && localId.length >= 10 && !companyInfo && (
        <div className="mt-4 p-4 border border-amber-100 rounded-md bg-amber-50 flex items-center gap-3 transition-all duration-300 animate-in fade-in">
          <div className="h-8 w-8 rounded-md bg-amber-100 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <h4 className="font-medium text-amber-800">Empresa não encontrada</h4>
            <p className="text-sm text-amber-600">
              Verifique o ID informado ou crie uma nova empresa.
            </p>
          </div>
        </div>
      )}

      {/* Complete button */}
      {onComplete && (
        <Button 
          type="button" 
          className="w-full mt-8"
          onClick={() => {
            if (companyInfo) {
              onComplete();
              toast.success(`Empresa ${companyInfo.nome} selecionada com sucesso!`);
            } else if (localId && localId.length >= 10) {
              toast.error("Empresa não encontrada. Verifique o ID informado.");
            } else {
              toast.error("Digite um ID de empresa válido.");
            }
          }}
          disabled={!companyInfo && localId.length >= 1}
        >
          Concluir
        </Button>
      )}
    </div>
  );
};

export default ExistingCompanyForm;
