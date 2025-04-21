
import React, { useState, useCallback, useEffect } from "react";
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
import { useQuickCompanyLookup } from "@/hooks/company/useQuickCompanyLookup";
import { Skeleton } from "@/components/ui/skeleton";
import { ValueItem } from "./company/NewCompanyValuesField";

interface CompanyStepProps {
  onNext: () => void;
  onBack: () => void;
  onCompanyTypeSelect: (isExisting: boolean) => void;
}

// Define the interface matching the expected structure in NewCompanyForm
interface CompanyDetails {
  name: string;
  logo?: string;
  frase_institucional: string;
  cor_principal: string;
  missao: string;
  valores: ValueItem[];
  video_institucional: string;
  descricao_video: string;
  historia: string;
}

const CompanyStep: React.FC<CompanyStepProps> = ({ onNext, onBack, onCompanyTypeSelect }) => {
  const { profileData, updateProfileData } = useOnboarding();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [companyType, setCompanyType] = useState<'existing' | 'new'>(
    profileData.companyId ? 'existing' : 'new'
  );
  const [companyId, setCompanyId] = useState(profileData.companyId || "");
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails>({
    name: profileData.newCompanyName || "",
    logo: "",
    historia: "",
    missao: "",
    valores: [],
    frase_institucional: "",
    video_institucional: "",
    descricao_video: "",
    cor_principal: "#000000"
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Novo estado para informações da empresa buscada
  const { companyInfo, loading: companyLoading, error: companyLookupError, fetchCompany } = useQuickCompanyLookup();
  const [showCompanyInfo, setShowCompanyInfo] = useState(false);

  // Chamada quando campo perde foco ou ID muda
  const handleCompanyLookup = useCallback(
    async (info: any, lookupPending: boolean) => {
      setShowCompanyInfo(false);
      if (companyId && companyId.length >= 10) {
        await fetchCompany(companyId);
        setShowCompanyInfo(true);
      }
    },
    [companyId, fetchCompany]
  );

  // Effect to automatically proceed when a valid company is selected
  useEffect(() => {
    // Only proceed automatically if we already have companyInfo loaded and the form is not already submitting
    if (companyType === 'existing' && companyInfo && showCompanyInfo && !isSubmitting) {
      setError(""); // Clear any previous errors
    }
  }, [companyInfo, showCompanyInfo, companyType, isSubmitting]);

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (isSubmitting) return;

    if (companyType === 'existing' && !companyId) {
      setError("Por favor, informe o ID da empresa");
      return;
    }

    if (companyType === 'new' && !companyDetails.name) {
      setError("Por favor, informe o nome da empresa");
      return;
    }

    setIsSubmitting(true);

    try {
      if (companyType === 'new') {
        if (!user) {
          toast.error("Usuário não autenticado");
          setIsSubmitting(false);
          return;
        }

        // Format valores for database - convert array to JSON string if needed
        const formattedValues = Array.isArray(companyDetails.valores) 
          ? JSON.stringify(companyDetails.valores)
          : companyDetails.valores;

        // Criar nova empresa
        const { data: newCompany, error: companyError } = await supabase
          .from('empresas')
          .insert({
            nome: companyDetails.name,
            logo: companyDetails.logo,
            historia: companyDetails.historia,
            missao: companyDetails.missao,
            valores: formattedValues,
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
        // Verificar se o ID da empresa existe antes de prosseguir
        if (!companyInfo) {
          // Se ainda não temos os dados da empresa, tente buscá-los antes de prosseguir
          await fetchCompany(companyId);
          if (!companyInfo) {
            setError("Empresa não encontrada com este ID");
            setIsSubmitting(false);
            return;
          }
        }

        updateProfileData({ 
          companyId: companyId,
          newCompanyName: null,
          companyDetails: null
        });

        // Importante: notificar o componente pai que uma empresa existente foi selecionada
        onCompanyTypeSelect(true);
        
        // Avançar para o próximo passo
        onNext();
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error("Erro ao processar operação: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompanyTypeChange = (type: 'existing' | 'new') => {
    setCompanyType(type);
    setError("");
    setShowCompanyInfo(false);
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
          <>
            <ExistingCompanyForm
              companyId={companyId}
              onCompanyIdChange={id => {
                setCompanyId(id);
                setShowCompanyInfo(false);
              }}
              onCompanyLookup={handleCompanyLookup}
            />
            {/* Exibe nome e logo se disponível */}
            {companyLoading ? (
              <div className="flex items-center gap-3 mt-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-5 w-24" />
              </div>
            ) : showCompanyInfo && companyInfo ? (
              <div className="flex items-center gap-4 mt-4 px-3 py-2 border rounded-md bg-gray-50">
                {companyInfo.logo ? (
                  <img
                    src={companyInfo.logo}
                    alt="Logo da empresa"
                    className="h-9 w-9 rounded-full bg-gray-200 object-contain"
                  />
                ) : (
                  <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-gray-200 font-bold text-lg text-gray-500">
                    {companyInfo.nome ? companyInfo.nome.charAt(0) : "?"}
                  </span>
                )}
                <span className="font-semibold text-gray-800">{companyInfo.nome}</span>
              </div>
            ) : showCompanyInfo && !companyInfo && !companyLoading && (
              <div className="mt-4 px-3 py-2 border rounded-md bg-gray-50 text-gray-500 text-sm">
                Empresa não encontrada.
              </div>
            )}
          </>
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
          disabled={isSubmitting || (companyType === 'existing' && !companyInfo && !companyLoading)}
        >
          {isSubmitting ? "Processando..." : "Continuar"}
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
    </form>
  );
};

export default CompanyStep;
