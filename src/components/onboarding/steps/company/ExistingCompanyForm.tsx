
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useQuickCompanyLookup } from "@/hooks/company/useQuickCompanyLookup";
import { toast } from "sonner";
import ExistingCompanyIDField from "./ExistingCompanyIDField";
import CompanyFoundMessage from "./CompanyFoundMessage";
import CompanyNotFoundMessage from "./CompanyNotFoundMessage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
  hideSubmitButton?: boolean;
}

const ExistingCompanyForm: React.FC<ExistingCompanyFormProps> = ({
  companyId = "",
  onCompanyIdChange = () => {},
  onCompanyLookup,
  onBack,
  onComplete,
  hideSubmitButton = false,
}) => {
  console.log("ExistingCompanyForm rendered with companyId:", companyId);
  
  // Estado local para o input
  const [inputValue, setInputValue] = useState(companyId);
  const [lookupDebounceTimer, setLookupDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [idValidated, setIdValidated] = useState(false);
  const [isAssociating, setIsAssociating] = useState(false);
  
  // Get current user
  const { user } = useAuth();
  
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
    
    // Configurar novo timer para buscar a empresa (mínimo 3 caracteres)
    if (newValue.trim().length >= 3) {
      const timer = setTimeout(() => {
        console.log("Buscando empresa:", newValue);
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

  // Função para associar o usuário à empresa
  const associateUserToCompany = async (companyId: string): Promise<boolean> => {
    if (!user?.id) {
      console.error("No user ID available");
      return false;
    }
    
    setIsAssociating(true);
    
    try {
      // Verificar se já existe uma relação
      const { data: existingRelation, error: checkError } = await supabase
        .from('user_empresa')
        .select('*')
        .eq('user_id', user.id)
        .eq('empresa_id', companyId)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (existingRelation) {
        console.log("User already associated with this company");
        return true;
      }
      
      // Criar nova relação
      const { error } = await supabase
        .from('user_empresa')
        .insert({
          user_id: user.id,
          empresa_id: companyId,
          is_admin: false
        });
        
      if (error) throw error;
      
      console.log("User successfully associated with company");
      
      // Disparar evento para atualizar as relações de empresa
      window.dispatchEvent(new CustomEvent('company-relation-changed'));
      
      return true;
    } catch (error: any) {
      console.error("Error associating user with company:", error);
      toast.error(`Erro ao associar usuário à empresa: ${error.message}`);
      return false;
    } finally {
      setIsAssociating(false);
    }
  };

  // Lidar com o envio do formulário
  const handleComplete = async () => {
    if (companyInfo && companyInfo.id) {
      try {
        // Tenta associar o usuário à empresa
        const success = await associateUserToCompany(companyInfo.id);
        
        if (success) {
          if (onComplete) {
            onComplete();
          }
          toast.success(`Empresa ${companyInfo.nome} selecionada com sucesso!`);
        }
      } catch (error: any) {
        console.error("Error during completion:", error);
        toast.error(`Erro ao concluir: ${error.message}`);
      }
    } else if (inputValue && inputValue.trim().length >= 3 && !companyInfo) {
      toast.error("Empresa não encontrada. Verifique o nome ou ID informado.");
    } else {
      toast.error("Digite o nome ou ID da empresa para continuar.");
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

      {/* Estado de empresa não encontrada - mostrar apenas após validação e quando tiver pelo menos 3 caracteres */}
      {!loading && idValidated && inputValue && inputValue.trim().length >= 3 && !companyInfo && (
        <CompanyNotFoundMessage />
      )}

      {/* Botão Concluir */}
      {!hideSubmitButton && onComplete && (
        <div className="flex justify-end pt-4 border-t">
          <Button 
            type="button" 
            className="min-w-[120px] bg-black hover:bg-black/90 text-white font-medium"
            onClick={handleComplete}
            disabled={!companyInfo || isAssociating}
          >
            {isAssociating ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                Processando...
              </span>
            ) : (
              "Concluir"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ExistingCompanyForm;
