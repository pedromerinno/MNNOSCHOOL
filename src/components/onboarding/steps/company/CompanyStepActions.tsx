
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface CompanyStepActionsProps {
  companyType: 'existing' | 'new';
  isSubmitting: boolean;
  companyInfo: any;
  companyLoading: boolean;
  onBack: () => void;
}

const CompanyStepActions: React.FC<CompanyStepActionsProps> = ({
  companyType,
  isSubmitting,
  companyInfo,
  companyLoading,
  onBack,
}) => {
  // Botão de Continuar/Criar deve ser desabilitado apenas quando:
  // 1. Form está sendo enviado
  // 2. Tipo é 'existing', sem companyInfo e não está carregando
  const isButtonDisabled = isSubmitting || 
                         (companyType === 'existing' && !companyInfo && !companyLoading);

  return (
    <div className="pt-4 flex flex-col gap-3">
      <Button 
        type="submit" 
        className="w-full rounded-md bg-black hover:bg-black/80 text-white"
        disabled={isButtonDisabled}
      >
        {isSubmitting
          ? (companyType === 'new' ? "Criando..." : "Processando...")
          : (companyType === 'new' ? "Criar Empresa" : "Continuar")}
      </Button>
      
      <Button 
        type="button" 
        variant="ghost"
        className="flex items-center justify-center gap-2 text-gray-500 mt-2"
        onClick={onBack}
        disabled={isSubmitting}
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>
    </div>
  );
};

export default CompanyStepActions;
