
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, Check } from "lucide-react";
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
  // Estado local para o input
  const [inputValue, setInputValue] = useState(companyId);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [idValidated, setIdValidated] = useState(false);
  
  // Hook para buscar informações da empresa
  const { companyInfo, loading, error, fetchCompany } = useQuickCompanyLookup();
  
  // Função para lidar com mudanças no input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Atualizamos diretamente o valor do input
    setInputValue(newValue);
    
    // Limpar a flag de validação quando o input muda
    setIdValidated(false);
    
    // Notify parent component
    onCompanyIdChange(newValue);
    
    // Limpar o timer anterior
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    // Configurar novo timer para buscar a empresa
    if (newValue.length >= 10) {
      const timer = setTimeout(() => {
        console.log("Buscando empresa com ID:", newValue);
        fetchCompany(newValue);
        setIdValidated(true);
      }, 500);
      setDebounceTimer(timer);
    }
  };

  // Limpar timers pendentes quando o componente desmontar
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  // Sincronizar com props quando companyId mudar externamente
  useEffect(() => {
    if (companyId !== inputValue) {
      setInputValue(companyId);
    }
    
    // Busca inicial se companyId for fornecido
    if (companyId && companyId.length >= 10 && !idValidated) {
      console.log("Busca inicial de empresa com ID:", companyId);
      fetchCompany(companyId);
      setIdValidated(true);
    }
  }, [companyId, fetchCompany, idValidated, inputValue]);

  // Notificar o componente pai sobre os resultados da busca
  useEffect(() => {
    if (onCompanyLookup) {
      onCompanyLookup(companyInfo, loading);
    }
  }, [companyInfo, loading, onCompanyLookup]);

  // Lidar com o envio do formulário
  const handleComplete = () => {
    if (onComplete && companyInfo) {
      onComplete();
      toast.success(`Empresa ${companyInfo.nome} selecionada com sucesso!`);
    } else if (inputValue && inputValue.length >= 10 && !companyInfo) {
      toast.error("Empresa não encontrada. Verifique o ID informado.");
    } else {
      toast.error("Digite um ID de empresa válido.");
    }
  };

  return (
    <div className="space-y-5">
      {/* Botão Voltar */}
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
        <label htmlFor="companyId" className="text-sm text-gray-500 font-medium">
          ID da empresa
        </label>
        <div className="relative">
          <Input
            id="companyId"
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            className="border border-gray-200 rounded-lg px-4 py-2 w-full"
            placeholder="Digite o ID da empresa"
            autoComplete="off"
          />
          {idValidated && companyInfo && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-500">
              <Check className="h-4 w-4" />
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Insira o ID da empresa para se vincular a uma empresa existente
        </p>
      </div>

      {/* Estado de carregamento */}
      {loading && (
        <div className="mt-4">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      )}

      {/* Estado de empresa encontrada */}
      {!loading && companyInfo && (
        <div className="mt-4 p-4 border border-emerald-100 rounded-lg bg-emerald-50 flex items-center gap-3 transition-all duration-300 animate-in fade-in">
          {companyInfo.logo ? (
            <img 
              src={companyInfo.logo} 
              alt={companyInfo.nome}
              className="h-8 w-8 object-contain rounded"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = "/placeholder.svg";
              }}
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-emerald-600" />
            </div>
          )}
          <div>
            <h4 className="font-medium text-emerald-800">Empresa encontrada</h4>
            <p className="text-sm text-emerald-600">{companyInfo.nome}</p>
          </div>
        </div>
      )}

      {/* Estado de empresa não encontrada - mostrar apenas após validação e quando o ID tiver comprimento válido */}
      {!loading && idValidated && inputValue && inputValue.length >= 10 && !companyInfo && (
        <div className="mt-4 p-4 border border-amber-100 rounded-lg bg-amber-50 flex items-center gap-3 transition-all duration-300 animate-in fade-in">
          <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
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

      {/* Botão Concluir */}
      {onComplete && (
        <Button 
          type="button" 
          className="mt-8 bg-black hover:bg-black/90 text-white"
          onClick={handleComplete}
          disabled={!companyInfo}
        >
          Concluir
        </Button>
      )}
    </div>
  );
};

export default ExistingCompanyForm;
