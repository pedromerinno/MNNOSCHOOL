
import React, { useState, useCallback, useEffect } from "react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useAuth } from "@/contexts/AuthContext";
import CompanyTypeSelector from "./CompanyTypeSelector";
import ExistingCompanyForm from "./ExistingCompanyForm";
import NewCompanyForm from "./NewCompanyForm";
import { useQuickCompanyLookup } from "@/hooks/company/useQuickCompanyLookup";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ValueItem } from "./NewCompanyValuesField";
import CompanyStepActions from "./CompanyStepActions";

interface CompanyStepFormProps {
  onNext: () => void;
  onBack: () => void;
  onCompanyTypeSelect: (isExisting: boolean) => void;
}

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

const CompanyStepForm: React.FC<CompanyStepFormProps> = ({ onNext, onBack, onCompanyTypeSelect }) => {
  const { profileData, updateProfileData } = useOnboarding();
  const { user } = useAuth();
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

  const { companyInfo, loading: companyLoading, error: companyLookupError, fetchCompany } = useQuickCompanyLookup();
  const [showCompanyInfo, setShowCompanyInfo] = useState(false);

  useEffect(() => {
    // Update onCompanyTypeSelect whenever companyType changes
    onCompanyTypeSelect(companyType === 'existing');
  }, [companyType, onCompanyTypeSelect]);

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

  useEffect(() => {
    if (companyType === 'existing' && companyInfo && showCompanyInfo && !isSubmitting) {
      setError("");
    }
  }, [companyInfo, showCompanyInfo, companyType, isSubmitting]);

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted - company type:", companyType);

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

        const formattedValues = Array.isArray(companyDetails.valores) 
          ? JSON.stringify(companyDetails.valores)
          : companyDetails.valores;

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

        const { error: relationError } = await supabase
          .from('user_empresa')
          .insert({
            user_id: user.id,
            empresa_id: newCompany.id,
            is_admin: true
          });

        if (relationError) throw relationError;

        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            is_admin: true,
            interesses: (profileData.interests || []).filter(i => i !== 'onboarding_incomplete')
          })
          .eq('id', user.id);

        if (profileError) throw profileError;

        toast.success("Empresa criada com sucesso!");
        window.location.href = `/company/${newCompany.id}`;
      } else {
        // This is the existing company case - we need to properly handle it
        console.log("Processing existing company submission with ID:", companyId);
        
        // If we don't have company info yet but have an ID, try to fetch it
        if (!companyInfo && companyId) {
          console.log("Fetching company info before proceeding");
          await fetchCompany(companyId);
          // Give a moment for the state to update with company info
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // After fetching, check if we found a company
        if (!companyInfo && !companyLoading) {
          console.log("Company not found after lookup");
          setError("Empresa não encontrada com este ID");
          setIsSubmitting(false);
          return;
        }

        console.log("Updating profile data with company ID:", companyId);
        // Update the profile data with the company ID
        updateProfileData({ 
          companyId: companyId,
          newCompanyName: null,
          companyDetails: null
        });

        // Signal that an existing company was selected
        onCompanyTypeSelect(true);
        
        console.log("Moving to next step");
        // Move to the next step - this is key for the button to work!
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

      <CompanyStepActions
        companyType={companyType}
        isSubmitting={isSubmitting}
        companyInfo={companyInfo}
        companyLoading={companyLoading}
        onBack={onBack}
      />
    </form>
  );
};

export default CompanyStepForm;
