
import React, { useState } from "react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import CompanyTypeSelector from "./company/CompanyTypeSelector";
import ExistingCompanyForm from "./company/ExistingCompanyForm";
import NewCompanyForm from "./company/NewCompanyForm";

interface CompanyStepProps {
  onNext: () => void;
  onBack: () => void;
  onCompanyTypeSelect: (isExisting: boolean) => void;
}

const CompanyStep: React.FC<CompanyStepProps> = ({ onNext, onBack, onCompanyTypeSelect }) => {
  const { profileData, updateProfileData } = useOnboarding();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [companyType, setCompanyType] = useState<'existing' | 'new'>(
    profileData.companyId ? 'existing' : 'new'
  );
  const [companyId, setCompanyId] = useState(profileData.companyId || "");
  const [companyDetails, setCompanyDetails] = useState({
    name: profileData.newCompanyName || "",
    description: "",
    historia: "",
    missao: "",
    valores: "",
    frase_institucional: "",
    video_institucional: "",
    descricao_video: "",
    cor_principal: "#000000"
  });
  const [error, setError] = useState("");

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (companyType === 'existing' && !companyId) {
      setError("Por favor, informe o ID da empresa");
      return;
    }

    if (companyType === 'new' && !companyDetails.name) {
      setError("Por favor, informe o nome da empresa");
      return;
    }
    
    try {
      if (companyType === 'new') {
        if (!user) {
          toast.error("Usuário não autenticado");
          return;
        }

        // Criar nova empresa
        const { data: newCompany, error: companyError } = await supabase
          .from('empresas')
          .insert({
            nome: companyDetails.name,
            historia: companyDetails.historia,
            missao: companyDetails.missao,
            valores: companyDetails.valores,
            frase_institucional: companyDetails.frase_institucional,
            video_institucional: companyDetails.video_institucional,
            descricao_video: companyDetails.descricao_video,
            cor_principal: companyDetails.cor_principal
          })
          .select()
          .single();

        if (companyError) throw companyError;

        // Associar usuário à empresa como admin
        const { error: relationError } = await supabase
          .from('user_empresa')
          .insert({
            user_id: user.id,
            empresa_id: newCompany.id,
            is_admin: true
          });

        if (relationError) throw relationError;

        // Atualizar perfil do usuário como admin
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            is_admin: true,
            interesses: (profileData.interests || []).filter(i => i !== 'onboarding_incomplete')
          })
          .eq('id', user.id);

        if (profileError) throw profileError;

        toast.success("Empresa criada com sucesso!");
        navigate("/");
      } else {
        updateProfileData({ 
          companyId: companyId,
          newCompanyName: null,
          companyDetails: null
        });
        onCompanyTypeSelect(true);
        onNext();
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error("Erro ao processar operação: " + error.message);
    }
  };

  const handleCompanyTypeChange = (type: 'existing' | 'new') => {
    setCompanyType(type);
    setError("");
  };

  return (
    <form onSubmit={handleInitialSubmit} className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-xl font-medium">Sobre sua empresa</h2>
        <p className="text-gray-500 text-sm">
          Você faz parte de uma empresa existente ou deseja criar uma nova?
        </p>
      </div>
      
      <CompanyTypeSelector
        companyType={companyType}
        onTypeChange={handleCompanyTypeChange}
      />
      
      <div className="pt-2">
        {companyType === 'existing' ? (
          <ExistingCompanyForm
            companyId={companyId}
            onCompanyIdChange={setCompanyId}
          />
        ) : (
          <NewCompanyForm
            companyDetails={companyDetails}
            onCompanyDetailsChange={setCompanyDetails}
          />
        )}
      </div>
      
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      
      <div className="pt-4 flex flex-col gap-3">
        <Button 
          type="submit" 
          className="w-full rounded-md bg-merinno-dark hover:bg-black text-white"
        >
          Continuar
        </Button>
        
        <Button 
          type="button" 
          variant="ghost"
          className="flex items-center justify-center gap-2 text-gray-500 mt-2"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>
    </form>
  );
};

export default CompanyStep;
