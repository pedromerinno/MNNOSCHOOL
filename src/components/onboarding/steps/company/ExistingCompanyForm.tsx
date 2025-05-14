
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useQuickCompanyLookup } from "@/hooks/company/useQuickCompanyLookup";
import { toast } from "sonner";
import ExistingCompanyIDField from "./ExistingCompanyIDField";
import CompanyFoundMessage from "./CompanyFoundMessage";
import CompanyNotFoundMessage from "./CompanyNotFoundMessage";

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
  console.log("ExistingCompanyForm rendered with companyId:", companyId);
  
  // Estado local para o input
  const [inputValue, setInputValue] = useState(companyId);
  const [lookupDebounceTimer, setLookupDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [idValidated, setIdValidated] = useState(false);
  
  // Hook para buscar informações da empresa
  const { companyInfo, loading, error, fetchCompany } = useQuickCompanyLookup();
  
  // Função para lidar com mudanças no input
  const handleInputChange = (newValue: string) => {
    console.log("ExistingCompanyForm - handleInputChange:", newValue);
    
    // Atualizamos o estado local
    setInputValue(newValue);
    
    // Limpar a flag de validação quando o input muda
    setIdValidated(false);
    
    // Notify parent component
    onCompanyIdChange(newValue);
    
    // Limpar o timer anterior
    if (lookupDebounceTimer) {
      clearTimeout(lookupDebounceTimer);
    }
    
    // Configurar novo timer para buscar a empresa
    if (newValue.length >= 10) {
      const timer = setTimeout(() => {
        console.log("Buscando empresa com ID:", newValue);
        fetchCompany(newValue);
        setIdValidated(true);
      }, 500);
      setLookupDebounceTimer(timer);
    }
  };

  // Limpar timers pendentes quando o componente desmontar
  useEffect(() => {
    return () => {
      if (lookupDebounceTimer) {
        clearTimeout(lookupDebounceTimer);
      }
    };
  }, [lookupDebounceTimer]);

  // Notificar o componente pai sobre os resultados da busca
  useEffect(() => {
    console.log("ExistingCompanyForm - companyInfo changed:", companyInfo);
    
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

      {/* ID da Empresa Input Field */}
      <ExistingCompanyIDField 
        inputValue={inputValue}
        onInputChange={handleInputChange}
        isValidated={idValidated}
        isCompanyFound={!!companyInfo}
      />

      {/* Estado de carregamento */}
      {loading && (
        <div className="mt-4">
          <div className="h-6 w-3/4 mb-2 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded"></div>
        </div>
      )}

      {/* Estado de empresa encontrada */}
      {!loading && companyInfo && (
        <CompanyFoundMessage 
          companyName={companyInfo.nome}
          logoUrl={companyInfo.logo}
        />
      )}

      {/* Estado de empresa não encontrada - mostrar apenas após validação e quando o ID tiver comprimento válido */}
      {!loading && idValidated && inputValue && inputValue.length >= 10 && !companyInfo && (
        <CompanyNotFoundMessage />
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
