import { useState } from "react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { ValueItem } from "./NewCompanyValuesField";
import type { CompanyType } from "./hooks/useCompanyType";
import { useCompanyType } from "./hooks/useCompanyType";
import { useCompanyDetails } from "./hooks/useCompanyDetails";
import { useExistingCompany } from "./hooks/useExistingCompany";

export { CompanyType };
export type { ValueItem };
export type { CompanyDetails } from "./hooks/useCompanyDetails";

export const useCompanyStepForm = (
  onNext: () => void,
  onBack: () => void,
  onCompanyTypeSelect: (isExisting: boolean) => void
) => {
  const { profileData, updateProfileData } = useOnboarding();
  const { user } = useAuth();

  // Company type hook
  const { companyType, setCompanyType, handleCompanyTypeChange } =
    useCompanyType(onCompanyTypeSelect);

  // Existing company ID
  const [companyId, setCompanyId] = useState(profileData.companyId || "");

  // Company details (new company)
  const { companyDetails, setCompanyDetails } = useCompanyDetails();

  // Existing company info/lookup
  const {
    companyInfo,
    companyLoading,
    showCompanyInfo,
    setShowCompanyInfo,
    handleCompanyLookup
  } = useExistingCompany(companyId);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear company info error on update
  // Only when not submitting and company info visible
  // showCompanyInfo ensures "Empresa não encontrada" feedback
  // Can also be handled at render in CompanyStepError

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (companyType === "existing" && !companyId) {
      setError("Por favor, informe o ID da empresa");
      return;
    }
    if (companyType === "new" && !companyDetails.name) {
      setError("Por favor, informe o nome da empresa");
      return;
    }

    setIsSubmitting(true);

    try {
      if (companyType === "new") {
        if (!user) {
          toast.error("Usuário não autenticado");
          setIsSubmitting(false);
          return;
        }

        const formattedValues = Array.isArray(companyDetails.valores)
          ? JSON.stringify(companyDetails.valores)
          : companyDetails.valores;

        const { data: newCompany, error: companyError } = await supabase
          .from("empresas")
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
          .from("user_empresa")
          .insert({
            user_id: user.id,
            empresa_id: newCompany.id,
            is_admin: true
          });

        if (relationError) throw relationError;

        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            is_admin: true,
            interesses: (profileData.interests || []).filter(
              (i) => i !== "onboarding_incomplete"
            )
          })
          .eq("id", user.id);

        if (profileError) throw profileError;

        toast.success("Empresa criada com sucesso!");
        window.location.href = `/company/${newCompany.id}`;
      } else {
        if (!companyInfo && companyId) {
          await handleCompanyLookup(null, true);
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        if (!companyInfo && !companyLoading) {
          setError("Empresa não encontrada com este ID");
          setIsSubmitting(false);
          return;
        }

        updateProfileData({
          companyId,
          newCompanyName: null,
          companyDetails: null
        });
        onCompanyTypeSelect(true);
        onNext();
      }
    } catch (error: any) {
      toast.error("Erro ao processar operação: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    companyType,
    setCompanyType,
    companyId,
    setCompanyId,
    companyDetails,
    setCompanyDetails,
    error,
    setError,
    isSubmitting,
    handleInitialSubmit,
    companyInfo,
    companyLoading,
    showCompanyInfo,
    setShowCompanyInfo,
    handleCompanyLookup,
    handleCompanyTypeChange,
    onBack
  };
};
